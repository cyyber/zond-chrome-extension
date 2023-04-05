<template>
 <ion-header>
    <ion-toolbar>
        <ion-title size="large">Send QRL</ion-title>
    </ion-toolbar>
 </ion-header>
 <ion-content>
    <ion-grid>
        <ion-row>
            <ion-select :value="tx_type" @ion-change="tx_type=$event.target.value" placeholder="Select transaction type">
                <ion-select-option value="transfer">Transfer</ion-select-option>
                <ion-select-option value="deploy_contract">Deploy Contract</ion-select-option>
                <ion-select-option value="interact_contract">Interact Contract</ion-select-option>
            </ion-select>
        </ion-row>
        <ion-row v-if="tx_type=='transfer'||tx_type=='interact_contract'">
            <ion-col>
            <ion-item>
                <ion-input placeholder="Send to"></ion-input>
            </ion-item>
            </ion-col>
        </ion-row>
        <ion-row v-if="tx_type=='transfer'">
            <ion-col>
            <ion-item>
                <ion-input placeholder="Amount"></ion-input>
            </ion-item>
            </ion-col>
        </ion-row>
        <ion-row v-if="tx_type=='deploy_contract'||tx_type=='interact_contract'">
            <ion-col>
                <ion-item>
                    <ion-textarea placeholder="Data" type="text"></ion-textarea>
                </ion-item>
            </ion-col>
        </ion-row>
        <ion-row v-if="tx_type=='deploy_contract'||tx_type=='interact_contract'||tx_type=='transfer'">
            <ion-item>
                <ion-input placeholder="Gas Price"></ion-input>
            </ion-item>
        </ion-row>
        <ion-row v-if="tx_type=='deploy_contract'||tx_type=='interact_contract'||tx_type=='transfer'">
            <ion-item>
                <ion-input placeholder="Gas"></ion-input>
            </ion-item>
        </ion-row>
        <ion-row>
            <ion-col></ion-col>
            <ion-col>
                <ion-button v-on:click="sendTransaction">Send</ion-button>
            </ion-col>
            <ion-col></ion-col>
        </ion-row>
        <ion-row>
            <ion-col></ion-col>
            <ion-col>
                <ion-button v-on:click="backToApp">Back</ion-button>
            </ion-col>
            <ion-col></ion-col>
        </ion-row>
    </ion-grid>
 </ion-content>
</template>
<script lang="ts">
import { IonContent, IonGrid, IonRow, IonCol, IonInput, IonButton, IonHeader, IonToolbar, IonTitle, IonItem, IonSelect, IonSelectOption, IonTextarea, modalController } from "@ionic/vue";
import { defineComponent } from "vue";
import {Storage} from '@ionic/storage'
import { setStore } from '@/store/ionic-storage';
import Dilithium from '@theqrl/wallet.js/src/dilithium'

export default defineComponent({
    name: 'SendTransaction',
    props: {
        id: String,
        index: Number
    },
    data(){
        return {
            tx_type: '',
            store: new Storage,
            result: {
                username: '',
                wallet: new Array<{
                name: string,
                balance: number,
                address: string,
                hexseed: string,
                mnemonic: string,
                tokens: Array<Record<string, unknown>>
                }>
            },
        }
    },
    components: {
        IonContent,
        IonHeader,
        IonToolbar,
        IonTitle,
        IonButton,
        IonRow,
        IonCol,
        IonInput,
        IonGrid,
        IonItem,
        IonSelect,
        IonSelectOption,
        IonTextarea
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
        async sendTransaction(){
            let message = "sample transaction"
            var d = new Dilithium(this.result.wallet[this.index?this.index:0].hexseed)
            var signature = await d.Sign(message)
        },
        backToApp() {
            return modalController.dismiss()
        },
    }
})
</script>