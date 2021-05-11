const editableList = ["set1", "set2", "set11", "set5", "set14", "set9", "set8", "set16", "set13", "set12", "set6", "set7", "set17"];

class Editor {
    constructor(element, doc) {
        this.element = element;
        this.doc = doc;
        this.edits = [];
    }

    handleFocus(e) {
        const elem = e.target;
        const i = elem.value.indexOf("：");
        if (i !== -1) {
            elem.setSelectionRange(i + 1, elem.value.length);
        }
    }

    handleChange(e) {
        const elem = e.target;
        if (elem.value === elem.dataset.defaultValue) {
            elem.classList.remove('edited');
        } else {
            elem.classList.add('edited');
        }
    }

    listEditor(element, targetElement) {
        targetElement.innerHTML = "";
        const list = element.children;
        const frag = document.createDocumentFragment();
        for (let i = 0; i < list.length; i++) {
            const _li = document.createElement('li');
            const _input = document.createElement('input');
            _input.setAttribute("type", "text");
            _input.dataset.defaultValue = list[i].textContent;
            _input.dataset.id = i;
            _input.dataset.optionValue = list[i].value;
            _input.value = list[i].textContent;
            _input.onchange = _input.onkeyup = this.handleChange;
            _input.onfocus = this.handleFocus;
            _li.appendChild(_input);
            frag.appendChild(_li);
        }
        targetElement.appendChild(frag);
    }

    appendNewInput(ul) {
        const cl = ul.lastChild.firstChild;
        const si = cl.dataset.defaultValue.indexOf("：");
        let val = "";
        if (si !== -1) {
            const num = Number(cl.dataset.defaultValue.slice(0, si));
            val = `${num + 1}：`;
        }
        const _li = document.createElement('li');
        const _input = document.createElement('input');
        _input.setAttribute("type", "text");
        _input.dataset.defaultValue = val;
        _input.dataset.id = Number(cl.dataset.id) + 1;
        _input.dataset.optionValue = Number(cl.dataset.optionValue) + 1;
        _input.value = val;
        _input.onchange = _input.onkeyup = this.handleChange;
        _input.onfocus = this.handleFocus;
        _li.appendChild(_input);
        ul.appendChild(_li);
    }

    editorAtomicGenerator(baseElement, name) {
        const div = document.createElement('div');
        const _p = document.createElement('p');
        const _button = document.createElement('button');
        _button.textContent = "追加する";
        _button.classList.add('addButton');
        _button.onclick = () => {
            this.appendNewInput(_ul);
        };
        _p.textContent = name;
        const _ul = document.createElement('ul');
        _ul.dataset.id = baseElement.getAttribute('id');
        div.appendChild(_p);
        div.appendChild(_ul);
        div.appendChild(_button);
        this.listEditor(baseElement, _ul);
        return div;
    }

    addEditor(id, name = null) {
        const elem = this.doc.getElementById(id);
        if (name === null) {
            name = elem.previousElementSibling.textContent.replace('■', '');
        }
        this.edits.push([this.editorAtomicGenerator(elem, name), elem])
    }

    apply() {
        const frag = document.createDocumentFragment();
        for (let item of this.edits) {
            frag.appendChild(item[0]);
        }
        this.element.appendChild(frag);
    }

    createNewOption(name, value) {
        const _o = this.doc.createElement('option');
        _o.value = value;
        _o.textContent = name;
        return _o;
    }

    syncElement() {
        for (let item of this.edits) {
            const baseCount = item[1].children.length;
            const newCount = item[0].children[1].children.length;
            for (let i = 0; i < newCount; i++) {
                const newItem = item[0].children[1].children[i].children[0];
                if (baseCount <= i) {
                    item[1].appendChild(this.createNewOption(newItem.value, newItem.dataset.optionValue));
                }
                item[1].children[i].textContent = newItem.value;
            }
        }
    }

    download() {
        this.syncElement()
        const _a = document.createElement('a');
        _a.setAttribute('download', 'index.html');
        _a.href = URL.createObjectURL(new Blob([this.doc.documentElement.innerHTML], {type: "text/html"}));
        document.body.appendChild(_a);
        _a.click();
    }
}

const htmlEditor = (text) => {
    const domparser = new DOMParser();
    const doc = domparser.parseFromString(text, "text/html");
    if (doc.title !== "棋譜読みちゃん") {
        alert("棋譜読みちゃんのindex.htmlを選択してください");
        document.getElementById('file_label').classList.remove('hide');
        return;
    }
    document.getElementById('edit').classList.remove('hide');
    const editor = new Editor(document.getElementById('edit'), doc);
    for (let k_id of editableList) {
        editor.addEditor(k_id);
    }
    editor.apply();
    document.getElementById('save').onclick = () => {
        editor.download()
    }
}


document.addEventListener('DOMContentLoaded', _ => {
    const fileE = document.getElementById('file');
    fileE.addEventListener('change', _ => {
        const reader = new FileReader();
        reader.onload = _ => {
            document.getElementById('file_label').classList.add('hide');
            htmlEditor(reader.result);
        }
        reader.readAsText(fileE.files[0]);
    })
    const terms = document.getElementById('terms');
    document.getElementById('termsOpen').addEventListener('click', () => {
        terms.classList.remove('hide');
    });
    document.getElementById('termsClose').addEventListener('click', () => {
        terms.classList.add('hide');
    });
    terms.addEventListener('click', e => {
        if (e.target !== terms) {
            return;
        }
        terms.classList.add('hide');
    });
})