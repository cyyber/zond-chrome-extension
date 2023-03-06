<template>
    <ion-app>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title size="large">Connect with QRL Wallet</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <ion-grid>
                <ion-row>
                    <ion-col></ion-col>
                    <ion-col>Choose account to connect</ion-col>
                    <ion-col></ion-col>
                </ion-row>
                
                    <ion-item v-for="accounts of result.wallet" v-bind:key="accounts.address">
                        <ion-checkbox slot="start" v-model="(accounts.checked)"></ion-checkbox>
                        <ion-label>{{accounts.name}} ({{accounts.address}})</ion-label>
                    </ion-item>
                <ion-row>
                    <ion-col></ion-col>
                    <ion-col><ion-button v-on:click="connectToApp">Connect</ion-button></ion-col> 
                    <ion-col></ion-col>
                </ion-row>
            </ion-grid>
        </ion-content>
    </ion-page>
    </ion-app>
</template>
<script lang="ts">
import { setStore } from '@/store/ionic-storage';
import {IonApp, IonPage, IonHeader, IonContent, IonToolbar, IonTitle, IonGrid, IonCol, IonRow, IonItem, IonCheckbox, IonLabel, IonButton} from '@ionic/vue';
import { defineComponent } from 'vue';
import {connectPopuptoBackground} from '../../service/controller'

export default defineComponent({
    name: 'Connect-flow',
    data() {
        return {
            acc_index: {},
            result: {
                username: '',
                wallet: new Array<{
                    name: string,
                    balance: number,
                    tokens: Array<Record<string, unknown>>,
                    address: string,
                    hexseed: string,
                    mnemonic: string,
                    checked: boolean
                }>
            },
        }
    },
    beforeMount(){
        this.getWallets(String(this.$route.params.id))
    },
    components: {
        IonApp,
        IonPage,
        IonHeader,
        IonToolbar,
        IonTitle,
        IonContent,
        IonGrid,
        IonRow,
        IonCol,
        IonItem,
        IonCheckbox,
        IonLabel,
        IonButton
    },
    methods: {
        async getWallets(id: string) {
            var store = await setStore()
            var wallet = await store.get(id)
            this.result = wallet
            this.result.wallet.map((i) => {
                i["checked"] = false
            })
        },
        async connectToApp() {
            let acc_arr:Array<string> = []
            console.log(this.result.wallet)
            this.result.wallet.map((i)=> {
                if(i.checked) {
                    acc_arr.push(i.address)
                }
            })
            let controllerPort = await connectPopuptoBackground()
            controllerPort.onMessage.addListener(async (msg)=> {
                if(msg.method == "req_account") {
                    controllerPort.postMessage({accounts: acc_arr})
                    window.close()
                }
            })
        }
    }
})
</script>