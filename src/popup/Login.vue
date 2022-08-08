<template>
    <ion-app>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title size="large">Welcome</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content :fullscreen="true" class="ion-padding">
            <ion-list>

                <ion-item>
                    <ion-input type="password" placeholder="Password"></ion-input>
                </ion-item>

                <ion-item v-if="token">
                    <ion-input type="password" placeholder="Confirm password"></ion-input>
                </ion-item>

            </ion-list>

            <ion-button expand="block" v-on:click="submit">Submit</ion-button>
        </ion-content>
    </ion-page>
    </ion-app>
</template>
<script lang="ts">
import { IonApp, IonPage, IonHeader, IonToolbar, IonContent, IonButton, IonTitle, IonItem, IonInput, IonList } from "@ionic/vue";
import { defineComponent } from "vue";
// import { useRouter } from "vue-router";

// const router = useRouter()

export default defineComponent({
    name: "Login-flow",
    components: {
        IonApp,
        IonPage,
        IonHeader,
        IonToolbar,
        IonContent,
        IonButton,
        IonTitle,
        IonInput,
        IonItem,
        IonList,
    },
    data() {
        return {
            token: true
        }
    },
    methods: {
        submit() {
            console.log(
                "reached here"
            )
            // this.$router.push({path: '/app'})
        }
    }
})

</script>