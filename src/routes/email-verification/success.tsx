import { type Component } from "solid-js"
import { Meta } from "solid-start"

const hostname = process.env.URL

const Page: Component = () => (
  <>
    <Meta http-equiv="refresh" content={`3;url=${hostname}/app/budget`} />
    <div>You have successfully verified your email address.</div>
  </>
)

export default Page
