import { placeholder } from './placeholder/placeholder.tpl.js';
import { annote } from './annote/annote.tpl.js';
import { ensign } from './ensign/ensign.tpl.js';
import { breadcrumbs, breadcrumbsPlaceholder } from './breadcrumbs/breadcrumbs.tpl.js';
import { mercator } from './mercator/mercator.tpl.js';
import { remark } from './remark/remark.tpl.js';
import { proof } from './proof/proof.tpl.js';
import { flex } from './flex/flex.tpl.js';
import { actions } from './actions/actions.tpl.js';

const templates = {
	actions: actions,
	annote: annote,
	breadcrumbs: breadcrumbs,
	breadcrumbsPlaceholder: breadcrumbsPlaceholder,
	ensign: ensign,
	flex: flex,
	mercator: mercator,
	placeholder: placeholder,
	proof: proof,
	remark: remark,
	br: () => { return document.createElement('br') },
	code: (text) => {
		let tag = document.createElement('code');
		tag.innerText = text;
		return tag;
	},
	link: (vars) => {
		let tag = document.createElement('a');
		tag.setAttribute('href', vars.href)
		tag.setAttribute('title', vars.title)
		tag.innerText = vars.text;
		return tag;
	},
	urlLink: (url) => {
		let readable = url
			.replace(/^[a-z]+\:\/\//, '')
			.replace(/^www\./, '')
			.replace(/\/index\.(php|html?)$/, '')
			.replace(/\/$/, '');
		let tag = document.createElement('a');
		tag.setAttribute('href', url)
		tag.classList.add('url')
		tag.innerText = readable;
		return tag;
	},
	idLink: (url) => {
		let wrapper = document.createElement('div');
		wrapper.style.fontSize = '.5em';
		wrapper.style.lineHeight = 1;
		let prefix = document.createTextNode('↳ ');
		wrapper.appendChild(prefix);
		if (url) {
			wrapper.appendChild(templates.urlLink(url));
		}
		else {
			wrapper.appendChild(templates.placeholder({}));
		}
		return wrapper;
	},
	idLinksPlaceholder: (prop, id) => {
		let o = document.createElement('div');
		o.classList.add('id-links-placeholder')
		o.setAttribute('data-prop', prop);
		o.setAttribute('data-id', id);
		for (var i = 0; i <= 4; i++) {
			o.appendChild(templates.idLink(false))
		}
		return o;
	},
	time: (vars) => {
		let tag = document.createElement('time');
		tag.appendChild(vars.text);
		return tag;
	},
	small: (text) => {
		let tag = document.createElement('small');
		tag.innerText = text;
		return tag;
	},
	title: (vars) => {
		let tag = document.createElement('em');
		tag.innerText = vars.text;
		if (vars.lang) {
			tag.setAttribute('lang', vars.lang);
		}
		return tag;
	},
	picture: (vars) => {
		let tag = document.createElement('img');
		let srcset = [];
		for (let key in vars.srcSet) {
			srcset.push(`${ vars.srcSet[key] } ${ key }w`);
		}
		tag.setAttribute('srcset', srcset.join(','));
		tag.setAttribute('loading', 'lazy');

		tag.setAttribute('src', vars.srcSet[0]);

		return tag;
	},
	image: (vars) => {
		let tag = document.createElement('img');
		tag.setAttribute('loading', 'lazy');

		tag.setAttribute('src', vars.src);

		return tag;
	},
	audio: (vars) => {
		let tag = document.createElement('audio');
		tag.setAttribute('controls', 'controls');
		tag.setAttribute('preload', 'none');

		tag.setAttribute('src', vars.src);
		
		return tag;
	},
	video: (vars) => {
		let tag = document.createElement('video');
		tag.setAttribute('controls', 'controls');

		tag.setAttribute('controlslist', 'nofullscreen');
		tag.setAttribute('preload', 'none');
		tag.setAttribute('poster', vars.poster);
		tag.setAttribute('src', vars.src);
		
		return tag;
	},
	footnoteRef: (vars) => {
		let tag = document.createElement('a');

		tag.classList.add('footnote');
		tag.setAttribute('href', vars.link);
		//tag.setAttribute('title', vars.title);
		tag.innerText = '*';

		return tag;
	},
	proxy: (vars) => {
		let tag = document.createElement('span');
		tag.setAttribute('data-query', vars.query);
		tag.classList.add('proxy');
		if (vars.text) {
			tag.innerText = vars.text;
		}
		
		return tag;
	},
	footer: (content) => {
		let wrapper = document.createElement('div');
		wrapper.classList.add('footer');
		wrapper.appendChild(content);
		
		return wrapper;
	}
};

export { templates }

