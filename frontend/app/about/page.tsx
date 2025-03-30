import React from 'react';
import Image from 'next/image';

export default function AboutUs() {
  return (
    <div className="bg-white dark:bg-gray-900 pt-16 transition-colors duration-200">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-[#4169E1] to-[#2AB7CA] dark:from-[#5278ed] dark:to-[#4fc3d5] py-20 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            About SkillShare
          </h1>
          <p className="mt-6 text-xl text-indigo-100 max-w-3xl mx-auto">
            Empowering learners through accessible, engaging, and effective educational experiences.
          </p>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-16 bg-white dark:bg-gray-900 transform skew-y-3 -translate-y-8 transition-colors duration-200"></div>
      </div>

      {/* Mission Statement */}
      <div className="py-16 bg-white dark:bg-gray-900 overflow-hidden transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl transition-colors duration-200">
                Our Mission
              </h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 transition-colors duration-200">
                At SkillShare, we believe that education should be accessible to everyone, regardless of their background or circumstances. 
                Our mission is to create a platform that democratizes learning and makes quality education available to all.
              </p>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 transition-colors duration-200">
                Through innovative teaching methods, engaging content, and a supportive community, 
                we aim to inspire a lifelong love of learning in our users.
              </p>
            </div>
            <div className="mt-10 lg:mt-0 relative">
              <div className="relative mx-auto w-full rounded-lg shadow-lg overflow-hidden">
                <div className="aspect-w-16 aspect-h-9">
                  <Image 
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80" 
                    alt="Students collaborating" 
                    width={600} 
                    height={400}
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-gray-50 dark:bg-gray-800 py-16 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl transition-colors duration-200">
            Meet Our Team
          </h2>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-600 dark:text-gray-300 transition-colors duration-200">
            Passionate educators and technologists committed to transforming online learning.
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Team Member 1 */}
            <div className="bg-white dark:bg-gray-700 rounded-lg shadow-lg overflow-hidden transform transition duration-500 hover:scale-105">
              <div className="h-64 overflow-hidden">
                <Image 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80" 
                  alt="Jane Doe" 
                  width={400} 
                  height={300}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="px-6 py-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-200">Jane Doe</h3>
                <p className="text-[#2AB7CA] dark:text-[#4fc3d5] transition-colors duration-200">Founder & CEO</p>
                <p className="mt-3 text-gray-600 dark:text-gray-300 transition-colors duration-200">
                  Former educator with 10+ years of experience in educational technology.
                </p>
              </div>
            </div>
            
            {/* Team Member 2 */}
            <div className="bg-white dark:bg-gray-700 rounded-lg shadow-lg overflow-hidden transform transition duration-500 hover:scale-105">
              <div className="h-64 overflow-hidden">
                <Image 
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80" 
                  alt="John Smith" 
                  width={400} 
                  height={300}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="px-6 py-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-200">John Smith</h3>
                <p className="text-[#2AB7CA] dark:text-[#4fc3d5] transition-colors duration-200">CTO</p>
                <p className="mt-3 text-gray-600 dark:text-gray-300 transition-colors duration-200">
                  Tech enthusiast with a background in building scalable educational platforms.
                </p>
              </div>
            </div>
            
            {/* Team Member 3 */}
            <div className="bg-white dark:bg-gray-700 rounded-lg shadow-lg overflow-hidden transform transition duration-500 hover:scale-105">
              <div className="h-64 overflow-hidden">
                <Image 
                  src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80" 
                  alt="Alice Johnson" 
                  width={400} 
                  height={300}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="px-6 py-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-200">Alice Johnson</h3>
                <p className="text-[#2AB7CA] dark:text-[#4fc3d5] transition-colors duration-200">Lead Curriculum Designer</p>
                <p className="mt-3 text-gray-600 dark:text-gray-300 transition-colors duration-200">
                  Instructional design expert focused on creating engaging learning experiences.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section with Image Background */}
      <div className="py-16 relative">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80"
            alt="Background"
            fill
            className="object-cover brightness-[0.25]"
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl text-center">
            Our Values
          </h2>
          <div className="mt-12 grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {/* Value 1 */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:translate-y-[-4px]">
              <div className="h-12 w-12 bg-gradient-to-r from-[#4169E1] to-[#2AB7CA] dark:from-[#5278ed] dark:to-[#4fc3d5] rounded-md flex items-center justify-center text-white mb-4 shadow-md transition-colors duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white transition-colors duration-200">Innovation</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300 transition-colors duration-200">
                We continuously explore new ways to enhance the learning experience.
              </p>
            </div>
            
            {/* Value 2 */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:translate-y-[-4px]">
              <div className="h-12 w-12 bg-gradient-to-r from-[#4169E1] to-[#2AB7CA] dark:from-[#5278ed] dark:to-[#4fc3d5] rounded-md flex items-center justify-center text-white mb-4 shadow-md transition-colors duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white transition-colors duration-200">Community</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300 transition-colors duration-200">
                We foster a supportive environment where learners can connect and grow together.
              </p>
            </div>
            
            {/* Value 3 */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:translate-y-[-4px]">
              <div className="h-12 w-12 bg-gradient-to-r from-[#4169E1] to-[#2AB7CA] dark:from-[#5278ed] dark:to-[#4fc3d5] rounded-md flex items-center justify-center text-white mb-4 shadow-md transition-colors duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white transition-colors duration-200">Accessibility</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300 transition-colors duration-200">
                We believe quality education should be accessible to everyone, regardless of background.
              </p>
            </div>
            
            {/* Value 4 */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:translate-y-[-4px]">
              <div className="h-12 w-12 bg-gradient-to-r from-[#4169E1] to-[#2AB7CA] dark:from-[#5278ed] dark:to-[#4fc3d5] rounded-md flex items-center justify-center text-white mb-4 shadow-md transition-colors duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white transition-colors duration-200">Excellence</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300 transition-colors duration-200">
                We are committed to providing high-quality content and exceptional learning experiences.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Section */}
      <div className="py-16 bg-white dark:bg-gray-900 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-[#4169E1]/5 to-[#2AB7CA]/5 dark:from-[#5278ed]/10 dark:to-[#4fc3d5]/10 rounded-xl transition-colors duration-200">
              <div className="text-5xl font-bold text-[#4169E1] dark:text-[#5278ed] transition-colors duration-200">50,000+</div>
              <div className="mt-4 text-xl text-gray-600 dark:text-gray-300 transition-colors duration-200">Students</div>
            </div>
            <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-[#4169E1]/5 to-[#2AB7CA]/5 dark:from-[#5278ed]/10 dark:to-[#4fc3d5]/10 rounded-xl transition-colors duration-200">
              <div className="text-5xl font-bold text-[#4169E1] dark:text-[#5278ed] transition-colors duration-200">200+</div>
              <div className="mt-4 text-xl text-gray-600 dark:text-gray-300 transition-colors duration-200">Courses</div>
            </div>
            <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-[#4169E1]/5 to-[#2AB7CA]/5 dark:from-[#5278ed]/10 dark:to-[#4fc3d5]/10 rounded-xl transition-colors duration-200">
              <div className="text-5xl font-bold text-[#4169E1] dark:text-[#5278ed] transition-colors duration-200">95%</div>
              <div className="mt-4 text-xl text-gray-600 dark:text-gray-300 transition-colors duration-200">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Our Story Section */}
      <div className="py-16 bg-gray-50 dark:bg-gray-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
            <div className="mb-10 lg:mb-0 lg:order-2">
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl transition-colors duration-200">
                Our Story
              </h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 transition-colors duration-200">
                SkillShare began with a simple idea: to make quality education accessible to everyone. 
                Founded in 2018 by a group of passionate educators and technologists, we've grown from 
                a small startup to a thriving platform serving students worldwide.
              </p>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 transition-colors duration-200">
                Our journey has been defined by a commitment to innovation and a deep belief in the 
                transformative power of education. We continually evolve our platform based on student 
                feedback and emerging educational research.
              </p>
            </div>
            <div className="lg:order-1">
              <div className="aspect-w-16 aspect-h-9 relative overflow-hidden rounded-xl shadow-xl">
                <Image 
                  src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80" 
                  alt="Our team at work" 
                  width={600} 
                  height={400}
                  className="object-cover w-full h-full rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Contact Section */}
      <div className="py-16 bg-white dark:bg-gray-900 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl mb-8 transition-colors duration-200">
            Get in Touch
          </h2>
          <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl shadow-md max-w-3xl mx-auto transition-colors duration-200">
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 transition-colors duration-200">
              Have questions or want to learn more about our platform? We'd love to hear from you!
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a 
                href="mailto:info@skillshare.com" 
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-[#4169E1] hover:bg-[#4169E1]/90 dark:bg-[#5278ed] dark:hover:bg-[#5278ed]/90 transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email Us
              </a>
              <a 
                href="/contact" 
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-[#4169E1] bg-[#4169E1]/5 hover:bg-[#4169E1]/10 dark:text-[#5278ed] dark:bg-[#5278ed]/10 dark:hover:bg-[#5278ed]/20 transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                Contact Form
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 