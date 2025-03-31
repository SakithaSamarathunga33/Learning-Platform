'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Facebook, Twitter, Instagram, Linkedin, ExternalLink, Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background pt-16 pb-8">
      <div className="container grid gap-12 md:grid-cols-2 lg:grid-cols-4">
        {/* Brand & About */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">EduLearn</span>
          </div>
          <p className="text-muted-foreground">
            Empowering learners worldwide with expert-led courses and hands-on projects.
            Join our community and advance your career with quality education.
          </p>
          <div className="flex gap-4">
            <Link 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="h-9 w-9 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors duration-200"
            >
              <Facebook className="h-4 w-4" />
              <span className="sr-only">Facebook</span>
            </Link>
            <Link 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="h-9 w-9 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors duration-200"
            >
              <Twitter className="h-4 w-4" />
              <span className="sr-only">Twitter</span>
            </Link>
            <Link 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="h-9 w-9 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors duration-200"
            >
              <Instagram className="h-4 w-4" />
              <span className="sr-only">Instagram</span>
            </Link>
            <Link 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="h-9 w-9 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors duration-200"
            >
              <Linkedin className="h-4 w-4" />
              <span className="sr-only">LinkedIn</span>
            </Link>
          </div>
        </div>

        {/* Explore Links */}
        <div>
          <h3 className="font-medium text-lg mb-4">Explore</h3>
          <ul className="space-y-3">
            <li>
              <Link href="/courses" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Courses</span>
              </Link>
            </li>
            <li>
              <Link href="/categories" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Categories</span>
              </Link>
            </li>
            <li>
              <Link href="/mentors" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Instructors</span>
              </Link>
            </li>
            <li>
              <Link href="/events" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Events</span>
              </Link>
            </li>
            <li>
              <Link href="/community" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Community</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Information Links */}
        <div>
          <h3 className="font-medium text-lg mb-4">Information</h3>
          <ul className="space-y-3">
            <li>
              <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
                <ExternalLink className="h-3.5 w-3.5" />
                <span>About Us</span>
              </Link>
            </li>
            <li>
              <Link href="/blog" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Blog</span>
              </Link>
            </li>
            <li>
              <Link href="/careers" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Careers</span>
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Privacy Policy</span>
              </Link>
            </li>
            <li>
              <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Terms of Service</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact & Newsletter */}
        <div>
          <h3 className="font-medium text-lg mb-4">Contact Us</h3>
          <ul className="space-y-3 mb-6">
            <li className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 mt-0.5 text-primary" />
              <span>123 Education St, Learning City, ED 54321</span>
            </li>
            <li className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4 text-primary" />
              <a href="mailto:info@edulearn.com" className="hover:text-primary transition-colors">info@edulearn.com</a>
            </li>
            <li className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4 text-primary" />
              <a href="tel:+1234567890" className="hover:text-primary transition-colors">+1 (234) 567-890</a>
            </li>
          </ul>
          
          <h4 className="font-medium mb-2">Subscribe to Newsletter</h4>
          <div className="flex gap-2">
            <Input type="email" placeholder="Your email" className="max-w-[240px]" />
            <Button>Subscribe</Button>
          </div>
        </div>
      </div>

      {/* Copyright & Legal Links */}
      <div className="container mt-16 pt-6 border-t">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} EduLearn. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Terms
            </Link>
            <Link href="/cookies" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 