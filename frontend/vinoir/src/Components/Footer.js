import React from "react";
import { Box, Typography, Link, Stack } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { Instagram, Facebook, Pinterest } from "@mui/icons-material";
import "./Footer.css";

const footerGroups = [
  {
    title: "Explore",
    links: [
      { label: "Home", to: "/" },
      { label: "Shop", to: "/shop" },
      { label: "About", to: "/about" },
      { label: "Contact", to: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", to: "/privacy-policy" },
      { label: "Terms of Service", to: "/terms-of-service" },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <Box component="footer" className="luxury-footer" role="contentinfo" aria-labelledby="footer-heading">
      <Box className="footer-shell">
        <Box className="footer-grid">
          <Box className="footer-section footer-brand" id="footer-brand">
            <Typography id="footer-heading" variant="h6" className="footer-heading" component="h2">
              VINOIR
            </Typography>
            <Typography variant="body2" className="footer-text" component="p">
              Luxury fragrances, curated with a modern editorial feel and an understated finish.
            </Typography>
            <Stack direction="row" spacing={1.25} sx={{ mt: 2 }} className="footer-social" aria-label="Social links">
              <Link href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="footer-social-link">
                <Instagram fontSize="small" />
              </Link>
              <Link href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" className="footer-social-link">
                <Facebook fontSize="small" />
              </Link>
              <Link href="https://pinterest.com" target="_blank" rel="noreferrer" aria-label="Pinterest" className="footer-social-link">
                <Pinterest fontSize="small" />
              </Link>
            </Stack>
          </Box>

          {footerGroups.map((group) => (
            <Box key={group.title} className="footer-section" aria-label={group.title}>
              <Typography variant="subtitle1" className="footer-heading" component="h3">
                {group.title}
              </Typography>
              {group.links.map((link) => (
                <Link
                  key={link.label}
                  component={RouterLink}
                  to={link.to}
                  className="footer-link"
                  underline="hover"
                  color="inherit"
                  aria-label={link.label}
                >
                  {link.label}
                </Link>
              ))}
            </Box>
          ))}

          <Box className="footer-section footer-contact" aria-label="Contact information">
            <Typography variant="subtitle1" className="footer-heading" component="h3">
              Contact
            </Typography>
            <Typography variant="body2" className="footer-text" component="p">
              <Link href="mailto:info@vinoir.com" underline="hover" color="inherit" aria-label="Email">
                info@vinoir.com
              </Link>
            </Typography>
            <Typography variant="body2" className="footer-text" component="p">
              <Link href="tel:+15551234567" underline="hover" color="inherit" aria-label="Phone">
                +1 (555) 123-4567
              </Link>
            </Typography>
            <Typography variant="body2" className="footer-text" component="p">
              Weekdays 9:00 - 17:00
            </Typography>
          </Box>
        </Box>

        <Box className="footer-bottom" aria-hidden="false">
          <Typography variant="caption" className="footer-copyright" component="p">
            © {year} VINOIR. All rights reserved.
          </Typography>
          <Typography variant="caption" className="footer-tagline" component="p">
            Crafted for a cleaner, calmer shopping experience.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}