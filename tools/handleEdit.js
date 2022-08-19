const CONTENT_TAGS_SELECTOR =
	'h1, h2, h3, p, b, a, button, label, legend, blockquote, cite';
const INPUTABLE_TAGS = ['input', 'textarea'];

const isElementControl = (tagName) =>
	document.activeElement.tagName.toLowerCase() === tagName;

const isControlElementActive = () =>
	INPUTABLE_TAGS.some(isElementControl);

const offSpellcheck = () => {
	document.querySelectorAll(CONTENT_TAGS_SELECTOR).forEach((element) => {
		element.spellcheck = false;
	});
};

export default (evt) => {
	if (evt.key.toLowerCase() === 'e' && !isControlElementActive()) {
		offSpellcheck();
		document.body.contentEditable = document.body.contentEditable !== 'true';
	}
};
