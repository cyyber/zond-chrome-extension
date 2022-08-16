<script lang="ts">
import { IonApp, IonRouterOutlet, IonPage } from '@ionic/vue';
import { defineComponent } from 'vue'

export default defineComponent({
    name: "App",
    components: {
        IonApp,
        IonPage,
        IonRouterOutlet
    }
})
</script>

<template>
  <ion-app>
    <ion-page>
        <ion-router-outlet></ion-router-outlet>
    </ion-page>
  </ion-app>
</template>
