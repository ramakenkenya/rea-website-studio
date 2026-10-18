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
