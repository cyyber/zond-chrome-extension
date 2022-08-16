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
            <ion-item>
                <ion-input placeholder="Send to"></ion-input>
            </ion-item>
        </ion-row>
        <ion-row v-if="tx_type=='transfer'">
            <ion-item>
                <ion-input placeholder="Amount"></ion-input>
            </ion-item>
        </ion-row>
        <ion-row v-if="tx_type=='deploy_contract'||tx_type=='interact_contract'">
            <ion-item>
                <ion-input placeholder="Data"></ion-input>
            </ion-item>
        </ion-row>
        <ion-row>
            <ion-col></ion-col>
            <ion-col>
                <ion-button>Send</ion-button>
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
import { IonContent, IonGrid, IonRow, IonCol, IonInput, IonButton, IonHeader, IonToolbar, IonTitle, IonItem, IonSelect, IonSelectOption, modalController } from "@ionic/vue";
import { defineComponent } from "vue";

export default defineComponent({
    name: 'SendTransaction',
    props: {
        id: String,
        index: Number
    },
    data(){
        return {
            tx_type: ''
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
        IonSelectOption
    },
    methods: {
        backToApp() {
            return modalController.dismiss()
        },
    }
})
</script>