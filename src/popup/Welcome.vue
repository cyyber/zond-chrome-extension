<template>
    <ion-app>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title size="large">Welcome</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content :fullscreen="true" class="ion-padding">
            <ion-button expand="block" @click="() => router.push('/app')">Get Started</ion-button>
        </ion-content>
    </ion-page>
    </ion-app>
</template>
<script lang="ts">
import { IonApp, IonPage, IonHeader, IonToolbar, IonContent, IonButton, IonTitle } from "@ionic/vue";
import { defineComponent } from "vue";
// import { useIonRouter } from '@ionic/vue';
import { useRouter } from "vue-router";

// router.routeInfo.routeDirection = 'back'
// router.push('some/path', 'back', 'replace')

// // navigation forward
// router.routeInfo.routeDirection = 'forward'
// router.push('some/path', 'forward', 'replace')

export default defineComponent({
    name: "Welcome-page",
    components: {
        IonApp,
        IonPage,
        IonHeader,
        IonToolbar,
        IonContent,
        IonButton,
        IonTitle
    },
    // methods: {
    //     dashBoard() {
    //         console.log(
    //             "reached here"
    //         )
    //         router.push({path: '/app'})
    //     }
    // },
    setup() {
      const router = useRouter();
      return { router };
    },
})

</script>