<template>
<ion-header>
    <ion-toolbar>
        <ion-title size="large">Account Options</ion-title>
    </ion-toolbar>
</ion-header>
<ion-content>
    <ion-grid>
        <ion-row>
            <ion-col></ion-col>
            <ion-col>
                <ion-button expand="full">
                    View on Explorer
                </ion-button>
            </ion-col>
            <ion-col></ion-col>
        </ion-row>
        <ion-row>
            <ion-col></ion-col>
            <ion-col>
                <ion-button expand="full" v-on:click="openAccountModal">
                    View Account Details
                </ion-button>
            </ion-col>
            <ion-col></ion-col>
        </ion-row>
        <ion-row>
            <ion-col></ion-col>
            <ion-col>
                <ion-button expand="full" v-on:click="openConnectedSites">
                    View Connected Sites
                </ion-button>
            </ion-col>
            <ion-col></ion-col>
        </ion-row>
        <ion-row>
            <ion-col></ion-col>
        </ion-row>
        <ion-row>
            <ion-col></ion-col>
            <ion-col>
                <ion-button expand="block" v-on:click="backToApp">
                    Go Back
                </ion-button>
            </ion-col>
            <ion-col></ion-col>
        </ion-row>
    </ion-grid>
</ion-content>
</template>
<script lang="ts">
import connectPopuptoBackground from '@/service/controller';
import { setStore } from '@/store/ionic-storage';
import {IonHeader, IonContent, IonToolbar, IonGrid, IonRow, IonCol, IonButton, IonTitle, modalController} from '@ionic/vue'
import {defineComponent} from 'vue'
import ConnectedSites from './ConnectedSites.vue';
import Mnemonic from './Mnemonic.vue'
import {Storage} from '@ionic/storage'

export default defineComponent({
    props: {
        id: String,
        index: Number
    },
    components: {
        IonHeader,
        IonContent,
        IonToolbar,
        IonGrid,
        IonTitle,
        IonRow,
        IonCol,
        IonButton
    },
    data() {
        return {
            store: new Storage,
            connectedSites: Array<string>,
            result: {
                username: '',
                wallet: new Array<{
                    name: string,
                    balance: number,
                    address: string,
                    hexseed: string,
                    mnemonic: string,
                }>
            },
        }
    },
    beforeMount(){
        this.getWallets(String(this.id), Number(this.index))
    },
    methods: {
        async getWallets(id: string, index: number) {
            var store = await setStore()
            this.store = store
            var wallet = await store.get(id)
            this.result = wallet
        },
        async openAccountModal() {
            const modal = await modalController.create({
                component: Mnemonic,
                componentProps: {
                    id: this.id,
                    index: this.index
                },
            });
            modal.present();
        },
        async openConnectedSites() {
            let account_arr = this.result.wallet
            let account = account_arr[Number(this.index)]
            let controllerPort = await connectPopuptoBackground()
            controllerPort.postMessage({
                method: "get_connectedSites",
                value: {
                    account: account["address"]
                }

            })
            controllerPort.onMessage.addListener(async (msg)=> {
                if(msg.method == "get_connectedSites") {
                    this.connectedSites = msg.value
                    const modal = await modalController.create({
                        component: ConnectedSites,
                        componentProps: {
                            connectedSites: this.connectedSites,
                            account: account["address"],
                        }
                    });
                    modal.present();
                }
            })
        },
        backToApp() {
            return modalController.dismiss()
        },
    }
})
</script>