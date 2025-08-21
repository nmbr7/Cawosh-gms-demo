import * as Dialog from '@radix-ui/react-dialog';
import { Menu, X } from 'lucide-react';
import Image from "next/image";
import { links } from './Sidebar';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from 'react';

export const HamburgerMenu=()=> {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {/* Trigger Button */}
      <Dialog.Trigger asChild>
        <button className=" text-black md:hidden">
          <Menu className="icon" />
        </button>
      </Dialog.Trigger>

      {/* Fullscreen Menu */}
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Content className="fixed inset-0 bg-white z-50 p-6 flex flex-col w-2/3">
          {/* Header with Close Button */}
          <div className="flex justify-between items-center mb-6">
            <Image
              src="/images/cawosh-logo.jpg"
              alt="Cawosh Logo"
              width={30}
              height={30}
              className="object-contain border p-0 m-0 h-8"
            />
            {/* <h2 className="text-lg font-bold">Cawosh Admin</h2> */}
            <Dialog.Title asChild>
              <h2 className="text-lg font-bold">Cawosh Admin</h2>
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-2">
                <X className="h-6 w-6" />
              </button>
            </Dialog.Close>
          </div>
          <nav className="flex flex-col gap-1 p-0">
          {links.map(({ name, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-md text-base font-medium",
                pathname === href
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              )}
              onClick={() => {
                setOpen(false);
              }}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{name}</span>
            </Link>
          ))}
        </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
