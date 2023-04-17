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
                <ion-input placeholder="Send to" v-model="to"></ion-input>
            </ion-item>
            </ion-col>
        </ion-row>
        <ion-row v-if="tx_type=='transfer'">
            <ion-col>
            <ion-item>
                <ion-input placeholder="Amount" type="number" v-model="amount"></ion-input>
            </ion-item>
            </ion-col>
        </ion-row>
        <ion-row v-if="tx_type=='deploy_contract'||tx_type=='interact_contract'">
            <ion-col>
                <ion-item>
                    <ion-textarea placeholder="Data" type="text" v-model="data"></ion-textarea>
                </ion-item>
            </ion-col>
        </ion-row>
        <ion-row v-if="tx_type=='deploy_contract'||tx_type=='interact_contract'||tx_type=='transfer'">
            <ion-item>
                <ion-input placeholder="Gas Price" v-model="gas_price"></ion-input>
            </ion-item>
        </ion-row>
        <ion-row v-if="tx_type=='deploy_contract'||tx_type=='interact_contract'||tx_type=='transfer'">
            <ion-item>
                <ion-input placeholder="Gas" v-model="gas"></ion-input>
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
import {providerWeb3Instance} from '../../service/controller'

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
            to: '',
            gas_price: '',
            gas: '',
            amount: '',
            data: '',
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
        this.getWallets(String(this.id))
    },
    methods: {
        async getWallets(id: string) {
            var store = await setStore()
            this.store = store
            var wallet = await store.get(id)
            this.result = wallet
        },
        async sendTransaction(){
            let web3 = providerWeb3Instance()
            let nonce = await web3.zond.getTransactionCount(this.result.wallet[this.index?this.index:0].address)
            let estimateGas = await web3.zond.estimateGas({
                from: this.result.wallet[this.index?this.index:0].address,
                data: this.data,
                to: this.to,
                value: parseInt(this.amount)
            });
            let hexseed = String(this.result.wallet[this.index?this.index:0].hexseed).slice(2)
            console.log(hexseed)
            let transaction = await web3.zond.accounts.signTransaction({
                from: this.result.wallet[this.index?this.index:0].address,
                data: this.data,
                to: this.to,
                amount: this.amount,
                gas: estimateGas,
                gasPrice: parseInt(this.gas_price),
                value: parseInt(this.amount),
                nonce: nonce,
                chainId: '0x1'
            }, hexseed);
            await web3.zond.sendSignedTransaction(
            transaction.rawTransaction
            ).on('receipt', console.log)
            .on('confirmation', function(confirmationNumber: any){
                console.log("confirmation no: ", confirmationNumber)
            });
            return modalController.dismiss()
        },
        backToApp() {
            return modalController.dismiss()
        },
    }
})
</script>