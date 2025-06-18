import FormRegister from "@/components/Form/FormRegister"

export const metadata = {
  title: "Register",
}

const Register = () => {
  return (
    <section className="max-w-96 w-[95%] rounded-md bg-slate-50 p-4 px-6 shadow">
      <h1 className="text-center poppins-semibold text-2xl">Welcome</h1>
      <p className="text-center text-slate-700 text-sm mb-8">Please fill out the register form</p>
      <FormRegister />
    </section>
  )
}

export default Register
