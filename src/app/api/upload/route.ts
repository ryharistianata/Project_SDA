
export const POST = async (req: Request) => {
    const formData = await req.formData()
    console.log(formData)
    return new Response(JSON.stringify({ formData }), { status: 200 })
}