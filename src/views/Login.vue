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
.login-container {
  max-width: 400px;
  width: 90%;
  margin: 80px auto;
  padding: 2rem;
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  font-family: 'Roboto', sans-serif;
}

.login-container h1 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333333;
  font-size: 1.75rem;
}

.login-container form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.login-container label {
  display: flex;
  flex-direction: column;
  font-size: 0.9rem;
  color: #555555;
}

.login-container input {
  margin-top: 0.5rem;
  padding: 0.75rem;
  border: 1px solid #cccccc;
  border-radius: 4px;
  transition: border-color 0.2s;
}

.login-container input:focus {
  outline: none;
  border-color: #667eea;
}

.login-container button {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #667eea;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
}

.login-container button:hover {
  background-color: #556cd6;
  transform: translateY(-1px);
}

.login-container button:active {
  transform: translateY(0);
}

.login-container .error {
  margin-top: 1rem;
  color: #e53e3e;
  font-size: 0.9rem;
  text-align: center;
}

.login-container p {
  text-align: center;
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #555555;
}

.login-container a {
  color: #667eea;
  text-decoration: none;
  transition: color 0.2s;
}

.login-container a:hover {
  color: #556cd6;
}

/* Responsywność */
@media (max-width: 480px) {
  .login-container {
    padding: 1.5rem;
  }

  .login-container h1 {
    font-size: 1.5rem;
  }

  .login-container button {
    font-size: 0.95rem;
  }
}
</style>
