import CheckIcon from "@/assets/check.svg"
import {twMerge} from "tailwind-merge"
import {motion} from "framer-motion"
const pricingTiers = [
  {
    title: "Free",
    monthlyPrice: 0,
    buttonText: "Get started for free",
    popular: false,
    inverse: true,
    features: [
      "Up to 3 reports per month",
      "Basic explanations",
      "Basic support",
    ],
  },
  {
    title: "Pro",
    monthlyPrice: 9,
    buttonText: "Coming soon",
    popular: true,
    inverse: false,
    features: [
      "Up to 10 reports per month",
      "Basic explanations",
      "Basic support",
      "Priority support",
      "Advanced support",
      "Export report",
    ],
  },
  {
    title: "Business",
    monthlyPrice: 19,
    buttonText: "Coming soon",
    popular: false,
    inverse: false,
    features: [
      "Unlimited reports",
      "Detailed explanations",
      "Priority support",
      "Health tracking",
      "Advanced analytics",
      "Export capabilities",
      "API access",
    ],
  },
];

export const Pricing = () => {
  return (
<section className="py-24 bg-white" id="pricingSection">
  <div className="container">
    <div className="section-heading">
  <h2 className="section-title">Pricing</h2>
  <p className="section-description mt-5">
    Free forever. Upgrade for unlimited tasks, better security, and exclusive features.
  </p>
  </div>
  <div className="flex flex-col gap-6 items-center mt-10 lg:flex-row lg:items-end lg:justify-center">
    {pricingTiers.map(
    ({
      title,
      monthlyPrice,
      buttonText, 
      popular, 
      inverse, 
      features
    }) => (
      
        <div key={title} className={twMerge("card", inverse === true && 'border-black bg-black text-white')}>
        <div className="flex justify-between">
        <h3 className={twMerge("text-lg font-bold text-black/50", inverse === true && "text-white/60")}>{title}</h3>
        {popular === true && (
        <div className="inline-flex text-sm px-4 py-1.5 rounded-xl border border-white/20">
        <span className="bg-[linear-gradient(to-right, #DD7DDF,#E1CD86, #BBCB92, #71C2EF, #3BFFF, #DD7DDF)] text-transparent bg-clip-text font-medium"> Popular</span>
        </div>
        )}
        </div>
        <div className="flex items-baseline gap-1 mt-[30px]">
          <span className="text-4xl font-bold tracking-tighter leading-none">${monthlyPrice}</span>
          <span className="traking-tight font-bold text-black/50">/month</span>
        </div>
        <button className={twMerge("btn btn-primary w-full mt-[30px]", inverse === true && "bg-white text-black")}>{buttonText}</button>
        <ul className="flex flex-col gap-5 mt-8">
          {features.map((feature) => (
            <li key={feature} className="text-sm flex items-center gap-4"> 
              <CheckIcon className="h-6 w-6"/>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
    </div>
    ))}
  </div>
  </div>
</section>
  );
};
