<template>
<ion-header>
    <ion-toolbar>
        <ion-title size="large">My Accounts</ion-title>
    </ion-toolbar>
</ion-header>
<ion-content>
    <!-- <ion-radio-group value="result.wallet[acc_index].name"> -->
    <ion-item v-for="(accounts, account_index) of result.wallet" v-bind:key="accounts.address">
        <ion-item button @click="()=>{acc_index=account_index}">{{accounts.name}}</ion-item>
        <!-- <ion-radio slot="end" ionSelect="()=>{acc_index=account_index}">{{accounts.name}}</ion-radio> -->
    </ion-item>
    <!-- </ion-radio-group> -->
    <ion-button expand="block" v-on:click="openCreateAccountModal(String(id))">Create Account</ion-button>
    <ion-button expand="block">Import Account</ion-button>
    <ion-button v-on:click="backToApp" expand="block">Back</ion-button>
</ion-content>
</template>
<script lang="ts">
import { IonContent, IonItem, IonLabel, IonHeader, IonToolbar, IonTitle, IonButton, IonRadioGroup, IonRadio, modalController } from '@ionic/vue';
import { defineComponent, ref } from 'vue';
import { setStore } from '@/store/ionic-storage';
import CreateAccount from './CreateAccount.vue'

export default defineComponent({
    props: {
        id: String,
        index: Number
    },
    data() {
        return {
            acc_index: this.index,
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
        IonItem,
        // IonLabel,
        IonHeader,
        IonToolbar,
        IonTitle,
        IonButton,
        // IonRadioGroup,
        // IonRadio
    },
    beforeMount(){
        this.getWallets(String(this.id), Number(this.index))
    },
    methods: {
        async getWallets(id: string, index: number) {
            var store = await setStore()
            var wallet = await store.get(id)
            this.result = wallet
        },
        async openCreateAccountModal(id: string) {
            const modal = await modalController.create({
                component: CreateAccount,
                componentProps: {
                id: id,
                },
            });
            modal.present();
        },
        backToApp() {
            return modalController.dismiss(this.acc_index)
        },
    }
});
</script>