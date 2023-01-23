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
                <ion-button expand="full">
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
import {IonHeader, IonContent, IonToolbar, IonGrid, IonRow, IonCol, IonButton, IonTitle, modalController} from '@ionic/vue'
import {defineComponent} from 'vue'
import Mnemonic from './Mnemonic.vue'

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
    methods: {
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
        backToApp() {
            return modalController.dismiss()
        },
    }
})
</script>