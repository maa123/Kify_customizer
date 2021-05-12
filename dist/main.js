const editableList = ["set1", "set2", "set11", "set5", "set14", "set9", "set8", "set16", "set13", "set12", "set6", "set7", "set17"];

const icon_trash = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M7,4 L7,3 C7,1.8954305 7.8954305,1 9,1 L15,1 C16.1045695,1 17,1.8954305 17,3 L17,4 L20,4 C21.1045695,4 22,4.8954305 22,6 L22,8 C22,9.1045695 21.1045695,10 20,10 L19.9198662,10 L19,21 C19,22.1045695 18.1045695,23 17,23 L7,23 C5.8954305,23 5,22.1045695 5.00345424,21.0830455 L4.07986712,10 L4,10 C2.8954305,10 2,9.1045695 2,8 L2,6 C2,4.8954305 2.8954305,4 4,4 L7,4 Z M7,6 L4,6 L4,8 L20,8 L20,6 L17,6 L7,6 Z M6.08648886,10 L7,21 L17,21 L17.0034542,20.9169545 L17.9132005,10 L6.08648886,10 Z M15,4 L15,3 L9,3 L9,4 L15,4 Z"/></svg>`;

const setEditMode = (flag = true) => {
    if (flag) {
        document.getElementById('file_label').classList.add('hide');
        document.getElementById('dropArea').classList.add('hide');
        document.getElementById('edit').classList.remove('hide');
    } else {
        document.getElementById('file_label').classList.remove('hide');
        document.getElementById('dropArea').classList.remove('hide');
        document.getElementById('edit').classList.add('hide');
    }
}

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
            if (list[i].dataset.customizerElement) {
                _input.dataset.canDelete = "true";
                const _delbutton = document.createElement('button');
                _delbutton.innerHTML = icon_trash;
                _delbutton.classList.add('delButton');
                _li.appendChild(_delbutton);
            }
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
        _input.dataset.canDelete = "true";
        const _delbutton = document.createElement('button');
        _delbutton.innerHTML = icon_trash;
        _delbutton.classList.add('delButton');
        _input.value = val;
        _input.onchange = _input.onkeyup = this.handleChange;
        _input.onfocus = this.handleFocus;
        _li.appendChild(_input);
        _li.appendChild(_delbutton);
        ul.appendChild(_li);
    }

    editorAtomicGenerator(baseElement, name) {
        const div = document.createElement('div');
        const _p = document.createElement('p');
        const _button = document.createElement('button');
        _button.textContent = "追加する";
        _button.classList.add('addButton');
        _button.classList.add('button-primary');
        _button.onclick = () => {
            this.appendNewInput(_ul);
        };
        _p.textContent = name;
        const _ul = document.createElement('ul');
        _ul.dataset.id = baseElement.getAttribute('id');
        div.classList.add('editContainer');
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
                    const _opt = this.createNewOption(newItem.value, newItem.dataset.optionValue);
                    _opt.dataset.customizerElement = "true";
                    item[1].appendChild(_opt);
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
        return;
    }
    setEditMode();
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
    const dropArea = document.getElementById('dropArea');
    dropArea.ondragover = e => {
        e.preventDefault();
        if (e.dataTransfer.items[0].type === "text/html") {
            dropArea.classList.add("hover");
        }
    }

    dropArea.ondragleave = () => {
        dropArea.classList.remove("hover");
    }
    dropArea.ondrop = e => {
        e.preventDefault();
        dropArea.classList.remove("hover");
        if (e.dataTransfer.items) {
            if (e.dataTransfer.items[0].kind === 'file') {
                if (e.dataTransfer.items[0].type !== "text/html") {
                    return false;
                }
                const reader = new FileReader();
                reader.onload = _ => {
                    htmlEditor(reader.result);
                }
                reader.readAsText(e.dataTransfer.items[0].getAsFile());
            }
        } else {
            const reader = new FileReader();
            reader.onload = _ => {
                htmlEditor(reader.result);
            }
            reader.readAsText(e.dataTransfer.files[0]);
        }
    }
})