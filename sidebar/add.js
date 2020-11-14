async function askIfStatementExists(subject, verb, object) {
	let question = `
		ASK {
  			wd:${subject} p:${verb} ?stmt .
  			?stmt ps:${verb} wd:${object} .
		}
	`;

	let answer = await sparqlQuery(question);
	if (answer.boolean) {
		return answer.boolean;
	} else {
		return false;
	}
}

let currentEntity = window.location.search.match(/^\?(\w\d+)/, '')[1];

browser.runtime.sendMessage({
	type: 'lock_sidebar',
});

let content = document.getElementById('content');
content.innerHTML = '';
(async () => {
	let entities = await wikidataGetEntity(currentEntity);
	let e = entities[currentEntity];

	let description = getValueByLang(e, 'descriptions', false);
	let hasDescription = description != false;

	content.appendChild(templates.ensign({
		revid: e.lastrevid,
		id: currentEntity,
		label: getValueByLang(e, 'labels', e.title),
		description: {
			text: description,
			provisional: !hasDescription
		},
	}));

	let direction = templates.direction({flippable: true});

	content.appendChild(direction);

	let propPicker = templates.express({entity: currentEntity});
	content.appendChild(propPicker.element);


	let receivedEntities = [];

	let saveButton = document.createElement('button');

	let checkSaveButton = function() {
		let selectedEntities = propPicker.selection.querySelectorAll(`[data-selected]`);
		if (selectedEntities.length > 0 && propPicker.element.hasAttribute('data-prop')) {
			saveButton.removeAttribute('disabled');
		} else {
			saveButton.setAttribute('disabled', 'disabled');
		}
	};

	browser.runtime.onMessage.addListener(async (data, sender) => {
		if (data.type === 'entity_add') {
			if (!receivedEntities.includes(data.id)) {
				receivedEntities.push(data.id);
				
				let tag = templates.express__tag({
					id: data.id,
					dest: propPicker.selection,
					src: propPicker.options,
					refresh: checkSaveButton,
				});

				propPicker.options.appendChild(tag);
				tag.postProcess();
			}
		}
		if (data.type === 'use_in_statement') {
			let target = propPicker.element.querySelector(`[data-entity="${ data.wdEntityId }"]`);

			target.toggle();

			(async () => {
				let flipped = direction.hasAttribute('data-flipped');
				let prop = propPicker.element.getAttribute('data-prop');
				let exists = await askIfStatementExists(flipped ? data.wdEntityId : currentEntity, prop , flipped ? currentEntity : data.wdEntityId);

				if (exists) {
					target.setAttribute('data-statement-exists', true);
				}
			})();

			if (data.reference.url) {
				target.setAttribute('data-reference-url', data.reference.url);
			}
			if (data.reference.section) {
				target.setAttribute('data-reference-section', data.reference.section);
			}
			if (data.reference.title) {
				target.setAttribute('data-reference-title', data.reference.title);
			}
			if (data.reference.language) {
				target.setAttribute('data-reference-language', data.reference.language);
			}
		}
	});

	browser.runtime.sendMessage({
		type: 'collect_pagelinks',
	});

	saveButton.setAttribute('disabled', 'disabled');
	saveButton.innerText = 'Send to Wikidata';

	document.body.appendChild(templates.footer(saveButton));

	propPicker.element.addEventListener('change', function() {
		checkSaveButton();
	});

	saveButton.addEventListener('click', function() {
		if (!saveButton.hasAttribute('disabled')) {
			saveButton.setAttribute('disabled', 'disabled')
			let selecteds = propPicker.selection.querySelectorAll('[data-selected]');

			let flipped = direction.hasAttribute('data-flipped');

			let now = new Date();

			let jobs = [];	

			for (let selected of selecteds) {

				let selectedId = selected.getAttribute('data-entity');
				let selectedNummericId = parseInt(selectedId.replace(/\w/,''));
				let currentEntityNummericId = parseInt(currentEntity.replace(/\w/,''));

				let reference = [];
				if (selected.getAttribute('data-reference-url')) {
					reference.push({
						"snaktype": "value",
						"property": "P854",
						"datavalue": {
							"value": selected.getAttribute('data-reference-url'),
							"type": "string"
						},
						"datatype": "url"
					});
				}

				if (selected.getAttribute('data-reference-title')) {
					reference.push({
						"snaktype": "value",
						"property": "P1476",
						"datavalue": {
							"value": {
								text: selected.getAttribute('data-reference-title'),
								language: selected.getAttribute('data-reference-language'),
							},
							"type": "monolingualtext"
						},
						"datatype": "string"
					});
				}

				if (selected.getAttribute('data-reference-section')) {
					reference.push({
						"snaktype": "value",
						"property": "P958",
						"datavalue": {
							"value": selected.getAttribute('data-reference-section'),
							"type": "string"
						},
						"datatype": "string"
					});
				}

				jobs.push({
					type: 'set_claim',
					subject: !flipped ? currentEntity : selectedId,
					verb: propPicker.element.getAttribute('data-prop'),
					object: {
						'entity-type': "item",
						'numeric-id': !flipped ? selectedNummericId : currentEntityNummericId,
					},
					references: reference ? [reference] : null,
				});

			}
			console.log(jobs);
			browser.runtime.sendMessage({
				type: 'send_to_wikidata',
				data: jobs,
			});
			browser.runtime.sendMessage({
				type: 'unlock_sidebar',
			});
			browser.runtime.sendMessage({
				type: 'clear_pagelinks',
			});


			window.location = 'entity.html?' + currentEntity;
		}
	});

})();

window.addEventListener('unload', (event) => {
	browser.runtime.sendMessage({
		type: 'unlock_sidebar',
	});
	browser.runtime.sendMessage({
		type: 'clear_pagelinks',
	});
});