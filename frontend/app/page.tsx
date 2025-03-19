'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-white pt-16">
        <div className="w-full">
          <div className="relative z-10 bg-white lg:max-w-[50%] lg:w-full">
            <main className="mx-auto w-full px-4 sm:px-6 lg:px-8">
              <div className="sm:text-center lg:text-left py-12 lg:py-20">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">Learn and Grow with</span>
                  <span className="block bg-gradient-to-r from-[#4169E1] to-[#2AB7CA] bg-clip-text text-transparent">
                    Expert Mentors
                  </span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Join our community of learners and mentors. Share knowledge, gain skills, and achieve your goals with personalized learning experiences.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link
                      href="/courses"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-[#4169E1] hover:bg-[#4169E1]/90 md:py-4 md:text-lg md:px-10 transition-all duration-200"
                    >
                      Browse Courses
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link
                      href="/mentors"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-[#4169E1] bg-[#4169E1]/5 hover:bg-[#4169E1]/10 md:py-4 md:text-lg md:px-10 transition-all duration-200"
                    >
                      Find Mentors
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <Image
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3"
            alt="Learning Platform"
            width={1920}
            height={1080}
            className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
            priority
          />
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-[#4169E1] font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to succeed
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Our platform provides all the tools and resources you need to learn effectively and achieve your goals.
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-x-8 md:gap-y-10">
              {/* Feature 1 */}
              <div className="relative bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-xl bg-[#4169E1]/10 text-[#4169E1]">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div className="ml-16">
                  <h3 className="text-lg font-medium text-gray-900">Expert-Led Courses</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Learn from industry experts through structured courses designed for practical skill development.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="relative bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-xl bg-[#FF6F00]/10 text-[#FF6F00]">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div className="ml-16">
                  <h3 className="text-lg font-medium text-gray-900">1-on-1 Mentorship</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Get personalized guidance from experienced mentors who can help you navigate your learning journey.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="relative bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-xl bg-[#2AB7CA]/10 text-[#2AB7CA]">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-16">
                  <h3 className="text-lg font-medium text-gray-900">Active Community</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Join a vibrant community of learners and mentors to share knowledge and experiences.
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="relative bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-xl bg-[#4169E1]/10 text-[#4169E1]">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-16">
                  <h3 className="text-lg font-medium text-gray-900">Verified Content</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Access quality-assured learning materials and resources vetted by industry experts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
