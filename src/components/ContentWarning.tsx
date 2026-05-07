import { MdWarning } from "react-icons/md";

export default async function ContentWarning({ warningContent }: { warningContent: string }) {
  return (
    <div className="my-4 space-y-2">
      <div role="alert" className="alert alert-warning">
        <MdWarning size={24} />
          {warningContent}
      </div>
    </div>
  );
}