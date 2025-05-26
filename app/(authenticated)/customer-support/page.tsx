import Image from "next/image";

export default function CustomerSupportPage() {
  return (
    <div className="flex flex-col items-center justify-center pt-28">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <Image
            src="/images/customer-support.png"
            alt="Customer Support"
            width={200}
            height={200}
          />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Customer Support
        </h1>
        <p className="text-gray-500">
          This section is coming soon. Stay tuned for updates!
        </p>
      </div>
    </div>
  );
}
