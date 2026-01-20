import { LoaderIcon } from "lucide-react";

const Loader = () => {
  return ( 
    <div className="h-dvh w-full flex items-center justify-center">
      <LoaderIcon className='shrink-0 animate-spin' size={16} />
    </div>
   );
}
 
export default Loader;