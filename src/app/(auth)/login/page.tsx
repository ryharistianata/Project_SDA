import FormLogin from "@/components/Form/FormLogin"

export const metadata = {
  title: "Login",
}
const Login = () => {
  return (
    <section className="max-w-96 w-[95%] rounded-md bg-slate-50 p-4 px-6 shadow mt-20">
      <h1 className="text-center poppins-semibold text-2xl">Welcome</h1>
      <p className="text-center text-slate-700 text-sm mb-8">Please fill out the login form</p>
      <FormLogin />
    </section>
  )
}

export default Login
