<template>
    <ion-app>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title size="large">Welcome</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content :fullscreen="true" class="ion-padding">
            <ion-button expand="block" v-on:click="dashBoard">Get Started</ion-button>
        </ion-content>
        <!-- <router-view></router-view> -->
    </ion-page>
    <router-view></router-view>
    </ion-app>
</template>
<script lang="ts">
import { IonApp, IonPage, IonHeader, IonToolbar, IonContent, IonButton, IonTitle } from "@ionic/vue";
import { defineComponent } from "vue";
// import { useIonRouter } from '@ionic/vue';
import { useRouter } from "vue-router";
var router = useRouter()

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
    methods: {
        dashBoard() {
            this.$router.push({path: `/login/${this.$route.query.task}`})
        }
    },
    setup() {
      const router = useRouter();
      return { router };
    },
})

</script>