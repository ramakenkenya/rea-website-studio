// Use GrapesJS's deep clone operation: toJSON() is shallow until serialized and
// loses component identity/style rules when fed directly back into the editor.
export function duplicateElement(editor,component){
 if(!component?.parent())throw Error('Select an element to duplicate.');
 const copy=component.clone();component.parent().append(copy,{at:component.index()+1});return copy;
}
export function duplicateEditorPage(editor,page,{id,name}){
 if(!page)throw Error('Select a page to duplicate.');
 return editor.Pages.add({id,name,component:page.getMainComponent().clone()});
}
export function captureReusableSection(editor,component){
 if(!component)throw Error('Select a section or element first.');
 let section=component;
 while(section.get('tagName')!=='section'&&section.parent()&&section.parent()!==editor.getWrapper())section=section.parent();
 const copy=section.clone();
 return {html:copy.toHTML(),css:editor.getCss({component:copy})};
}
export function insertReusableSection(editor,section){
 if(section.css)editor.addStyle(section.css);
 return editor.addComponents(section.html,{at:Math.max(0,editor.getWrapper().components().length-1),cloneRules:true});
}

// Model traversal also works for pages whose canvas has never been rendered.
export function studioNavigation(wrapper){
 return wrapper.findType(c=>c.getAttributes()['data-studio-nav']==='true'||c.get('tagName')==='header'&&c.getClasses().includes('site-nav'),{max:1})[0];
}
export function studioShortcut(event,editor,save){
 const original=event._parentEvent||event;
 if(!(event.ctrlKey||event.metaKey)||event.altKey)return;
 const key=event.key.toLowerCase();
 if(key!=='s'&&original.target?.closest?.('input,textarea,select,[contenteditable=true]'))return;
 if(!['s','z','y'].includes(key))return;
 event.preventDefault();if(original!==event)original.preventDefault();
 if(key==='s')save();else if(key==='y'||event.shiftKey)editor.UndoManager.redo();else editor.UndoManager.undo();
}
