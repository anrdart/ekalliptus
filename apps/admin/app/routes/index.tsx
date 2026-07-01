import { redirect } from "react-router";

export const loader = () => {
  return redirect("/admin");
};

export default function Index() {
  return null;
}
