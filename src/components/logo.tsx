import Image from "next/image";

export default function Logo() {
  return (
    <Image
      src="/logo.png"
      alt="logo"
      width={40}
      height={40}
      className="dark:bg-teal-400/5 bg-teal-500 rounded-md"
    />
  );
}
