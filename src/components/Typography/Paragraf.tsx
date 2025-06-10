
const Paragraf = ({
    children,
    classs = ""
  }: {
    children: React.ReactNode;
    classs: string
  }
) => {
  return (
    <p className={`leading-7 [&:not(:first-child)]:mt-6 ${classs}`}>
      {children}
    </p>
  )
}

export default Paragraf
