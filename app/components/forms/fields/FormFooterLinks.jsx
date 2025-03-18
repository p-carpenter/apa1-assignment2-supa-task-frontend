import React from "react";
import Link from "next/link";
import authStyles from "../Auth.module.css";

/**
 * Component for displaying form footer links, typically used in auth forms
 * 
 * @param {Array} links - Array of link objects with label, href, and text properties
 * @param {string} className - Additional CSS class names
 */
const FormFooterLinks = ({ links = [], className = "" }) => {
  if (!links || !links.length) return null;
  
  return (
    <div className={`${authStyles.authFooter} ${className}`}>
      {links.map((link, index) => (
        <p key={index}>
          {link.label}{" "}
          <Link href={link.href} className={authStyles.authLink}>
            {link.text}
          </Link>
        </p>
      ))}
    </div>
  );
};

export default FormFooterLinks;