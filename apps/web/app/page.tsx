import Link from "next/link";

export default function Home() {
  return (
    <div className="flex w-full justify-center items-center gap-7 mt-3 ">
      <Link href="/sender">Sender</Link>
      <Link href="/reciever">Reciever</Link>
    </div>
  );
}
