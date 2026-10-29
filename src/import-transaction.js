export async function replaceImportedProject(adapter,next){
 const previous=adapter.capture();adapter.pause();let success=false;
 try{await adapter.apply(next);success=true;}
 catch(error){try{await adapter.apply(previous);}catch{throw Error('Import failed and the canvas could not be restored. Use your downloaded project backup.');}throw error;}
 finally{adapter.resume(success);}
}
