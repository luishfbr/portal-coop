import axios from "axios"

export const api = axios.create({
  baseURL: "http://localhost:8080/api/v1",
  timeout: 10_000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.message ?? err.message ?? "Erro desconhecido"
    return Promise.reject(new Error(message))
  }
)
