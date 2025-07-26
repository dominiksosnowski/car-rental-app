<template>
  <div class="login-container">
    <h1>Panel logowania</h1>

    <form @submit.prevent="handleSubmit">
      <label>
        Email
        <input type="email" v-model="email" required />
      </label>

      <label>
        Hasło
        <input type="password" v-model="password" required />
      </label>

      <button type="submit">{{ isSignUp ? 'Zarejestruj' : 'Zaloguj' }}</button>
    </form>

    <p v-if="authStore.error" class="error">{{ authStore.error }}</p>

    <p>
      <a href="#" @click.prevent="toggleMode">
        {{ isSignUp ? 'Masz już konto? Zaloguj się' : 'Nie masz konta? Zarejestruj się' }}
      </a>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const isSignUp = ref(false)
const authStore = useAuthStore()
const router = useRouter()

const handleSubmit = async () => {
  await (isSignUp.value
    ? authStore.signUp(email.value, password.value)
    : authStore.signIn(email.value, password.value)
  )

  console.log('current user after submit:', authStore.user)
  if (authStore.user) {
    router.push({ name: 'Dashboard' })
  }
}
</script>


<style scoped>

</style>
