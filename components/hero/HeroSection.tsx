import Link from "next/link";
import React from "react";

export interface HeroButton {
  href: string;
  text: string;
  variant?: "primary" | "secondary";
}

export interface HeroSectionProps {
  backgroundImage: string;
  title: string;
  description?: string;
  buttons?: HeroButton[];
  height?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  backgroundImage,
  title,
  description,
  buttons,
  height = "800px",
}) => {
  return (
    <section
      className="relative container-custom bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url('${backgroundImage}')`,
        height,
      }}
    >
      <div className="w-full h-full">
        <div className="p-12 flex flex-col justify-end gap-3 h-full">
          <h1 className="text-display-md md:text-display-lg font-bold text-white mb-6">
            {title}
          </h1>
          {description && (
            <p className="text-body-lg text-white/90 mb-6 max-w-2xl">
              {description}
            </p>
          )}
          {buttons && buttons.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-4">
              {buttons.map((button, index) => (
                <Link
                  key={index}
                  href={button.href}
                  className={`inline-flex items-center justify-center px-6 py-3 rounded-[50px] font-medium transition-colors ${
                    button.variant === "primary"
                      ? "bg-white text-black hover:bg-transparent hover:text-white hover:border-2 hover:border-white"
                      : "text-white hover:bg-white hover:text-foreground hover:border-2 hover:border-white"
                  }`}
                >
                  {button.text}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

