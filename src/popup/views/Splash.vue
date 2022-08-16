<template>
<ion-app>
    <ion-page>
       <ion-header></ion-header> 
       <ion-content>
        <ion-title>
            QRL Zond Wallet
        </ion-title>
       </ion-content>
       <!-- <router-view></router-view> -->
    </ion-page>
</ion-app>
</template>

<script lang="ts">
import {IonApp, IonPage, IonContent, IonTitle, IonHeader} from '@ionic/vue'
import { defineComponent } from 'vue'
import { useRouter } from "vue-router"

export default defineComponent({
    name: "Splash-screen",
    data() {
        return {account: ["ad", "fd"]}
    },
    watch: {
        accountExists() {
            // var account = []
            if(this.account.length > 1) {
                this.$router.push('/login')
            } else {
                this.$router.push('/welcome')
            }
        }
    },
    components: {
        IonApp,
        IonPage,
        IonContent,
        IonTitle,
        IonHeader
    },
    setup() {
        const router = useRouter();
        return { router };
    },
})
</script>