import { Storage, Drivers } from '@ionic/storage';


const store = new Storage({
    name: '__mydb',
    driverOrder: [Drivers.IndexedDB, Drivers.LocalStorage]
});

async function setStore(){
    await store.create();
    return store
}

export {setStore};