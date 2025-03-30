'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useInView } from 'react-intersection-observer';

// Animation utility for staggered animations
type AnimationProps = {
  initial: { opacity: number; y: number };
  animate: {
    opacity: number;
    y: number;
    transition: {
      delay: number;
      duration: number;
      ease: number[];
    };
  };
};

const useStaggeredAnimation = (staggerDelay = 0.1, initialDelay = 0): ((index: number) => AnimationProps) => {
  return (index: number) => {
    return {
      initial: { opacity: 0, y: 20 },
      animate: { 
        opacity: 1, 
        y: 0, 
        transition: { 
          delay: initialDelay + index * staggerDelay,
          duration: 0.5,
          ease: [0.22, 1, 0.36, 1]
        } 
      }
    };
  };
};

export default function HomePage() {
  // Intersection observers for scroll-triggered animations
  const [heroRef, heroInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [featuresRef, featuresInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [statsRef, statsInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [testimonialsRef, testimonialsInView] = useInView({ threshold: 0.1, triggerOnce: true });

  // Create animation instance to prevent linter warnings
  const _getAnimation = useStaggeredAnimation();

  // Animation for counting up numbers
  const [countedUp, setCountedUp] = useState(false);
  const studentsCount = useRef(0);
  const coursesCount = useRef(0);
  const ratingsCount = useRef(0);

  useEffect(() => {
    if (statsInView && !countedUp) {
      setCountedUp(true);
      const duration = 2000;
      const frameDuration = 1000 / 60;
      const totalFrames = Math.round(duration / frameDuration);
      
      const studentsCounter = document.getElementById('students-count');
      const coursesCounter = document.getElementById('courses-count');
      const ratingsCounter = document.getElementById('ratings-count');
      
      const studentsEndValue = 50000;
      const coursesEndValue = 200;
      const ratingsEndValue = 95;
      
      let frame = 0;
      const countUpAnimation = () => {
        frame++;
        const progress = frame / totalFrames;
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        
        studentsCount.current = Math.floor(easeOutCubic * studentsEndValue);
        coursesCount.current = Math.floor(easeOutCubic * coursesEndValue);
        ratingsCount.current = Math.floor(easeOutCubic * ratingsEndValue);
        
        if (studentsCounter) studentsCounter.innerText = `${studentsCount.current.toLocaleString()}+`;
        if (coursesCounter) coursesCounter.innerText = `${coursesCount.current}+`;
        if (ratingsCounter) ratingsCounter.innerText = `${ratingsCount.current}%`;
        
        if (frame < totalFrames) {
          requestAnimationFrame(countUpAnimation);
        }
      };
      
      requestAnimationFrame(countUpAnimation);
    }
  }, [statsInView, countedUp]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Hero Section */}
      <div ref={heroRef} className="relative bg-white dark:bg-gray-800 pt-16 transition-colors duration-200">
        <div className="w-full">
          <div className="relative z-10 bg-white dark:bg-gray-800 lg:max-w-[50%] lg:w-full transition-colors duration-200">
            <main className="mx-auto w-full px-4 sm:px-6 lg:px-8">
              <div className="sm:text-center lg:text-left py-12 lg:py-20">
                <h1 className={`text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl transition-colors duration-200 ${heroInView ? 'animate-fadeIn' : 'opacity-0'}`}>
                  <span className="block">Learn and Grow with</span>
                  <span className="block bg-gradient-to-r from-[#4169E1] to-[#2AB7CA] bg-clip-text text-transparent animate-gradient">
                    Expert Mentors
                  </span>
                </h1>
                <p className={`mt-3 text-base text-gray-500 dark:text-gray-300 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0 transition-colors duration-200 ${heroInView ? 'animate-fadeInUp animate-delay-100' : 'opacity-0'}`}>
                  Join our community of learners and mentors. Share knowledge, gain skills, and achieve your goals with personalized learning experiences.
                </p>
                <div className={`mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start ${heroInView ? 'animate-fadeInUp animate-delay-200' : 'opacity-0'}`}>
                  <div className="rounded-md shadow">
                    <Link
                      href="/courses"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-[#4169E1] hover:bg-[#4169E1]/90 dark:bg-[#5278ed] dark:hover:bg-[#5278ed]/90 md:py-4 md:text-lg md:px-10 transition-all duration-200"
                    >
                      Browse Courses
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link
                      href="/mentors"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-[#4169E1] bg-[#4169E1]/5 hover:bg-[#4169E1]/10 dark:text-[#5278ed] dark:bg-[#5278ed]/10 dark:hover:bg-[#5278ed]/20 md:py-4 md:text-lg md:px-10 transition-all duration-200"
                    >
                      Find Mentors
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className={`lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 ${heroInView ? 'animate-fadeInRight animate-delay-300' : 'opacity-0'}`}>
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
      <div 
        ref={featuresRef} 
        className="py-24 bg-white dark:bg-gray-800 transition-colors duration-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center max-w-3xl mx-auto ${featuresInView ? 'animate-fadeIn' : 'opacity-0'}`}>
            <span className="inline-block px-3 py-1 text-sm font-semibold bg-[#4169E1]/10 dark:bg-[#5278ed]/20 text-[#4169E1] dark:text-[#5278ed] rounded-full mb-4 transition-colors duration-200">
              Features
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white transition-colors duration-200">
              Everything you need to succeed
            </h2>
            <p className="mt-4 text-xl text-gray-500 dark:text-gray-300 transition-colors duration-200">
              Our platform provides all the tools and resources you need to learn effectively and achieve your goals.
            </p>
          </div>

          <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {/* Feature 1 */}
            <div className={`group ${featuresInView ? 'animate-fadeInUp animate-delay-0' : 'opacity-0'}`}>
              <div className="relative h-12 w-12 mx-auto mb-4">
                <div className="absolute inset-0 bg-[#4169E1]/10 dark:bg-[#5278ed]/20 rounded-xl transform rotate-6 group-hover:rotate-12 transition-transform duration-300"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-[#4169E1] to-[#2AB7CA] dark:from-[#5278ed] dark:to-[#4fc3d5] rounded-xl flex items-center justify-center text-white transform group-hover:scale-110 transition-all duration-300">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-center text-gray-900 dark:text-white transition-colors duration-200">
                Expert-Led Courses
              </h3>
              <p className="mt-3 text-center text-gray-500 dark:text-gray-300 px-4 transition-colors duration-200">
                Learn from industry experts through structured courses designed for practical skill development.
              </p>
            </div>

            {/* Feature 2 */}
            <div className={`group ${featuresInView ? 'animate-fadeInUp animate-delay-100' : 'opacity-0'}`}>
              <div className="relative h-12 w-12 mx-auto mb-4">
                <div className="absolute inset-0 bg-[#FF6F00]/10 dark:bg-[#FF7F1D]/20 rounded-xl transform rotate-6 group-hover:rotate-12 transition-transform duration-300"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF6F00] to-[#FF9800] dark:from-[#FF7F1D] dark:to-[#FFA726] rounded-xl flex items-center justify-center text-white transform group-hover:scale-110 transition-all duration-300">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-center text-gray-900 dark:text-white transition-colors duration-200">
                1-on-1 Mentorship
              </h3>
              <p className="mt-3 text-center text-gray-500 dark:text-gray-300 px-4 transition-colors duration-200">
                Get personalized guidance from experienced mentors who can help you navigate your learning journey.
              </p>
            </div>

            {/* Feature 3 */}
            <div className={`group ${featuresInView ? 'animate-fadeInUp animate-delay-200' : 'opacity-0'}`}>
              <div className="relative h-12 w-12 mx-auto mb-4">
                <div className="absolute inset-0 bg-[#2AB7CA]/10 dark:bg-[#4fc3d5]/20 rounded-xl transform rotate-6 group-hover:rotate-12 transition-transform duration-300"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-[#2AB7CA] to-[#00BCD4] dark:from-[#4fc3d5] dark:to-[#26C6DA] rounded-xl flex items-center justify-center text-white transform group-hover:scale-110 transition-all duration-300">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-center text-gray-900 dark:text-white transition-colors duration-200">
                Active Community
              </h3>
              <p className="mt-3 text-center text-gray-500 dark:text-gray-300 px-4 transition-colors duration-200">
                Join a vibrant community of learners and mentors to share knowledge and experiences.
              </p>
            </div>

            {/* Feature 4 */}
            <div className={`group ${featuresInView ? 'animate-fadeInUp animate-delay-300' : 'opacity-0'}`}>
              <div className="relative h-12 w-12 mx-auto mb-4">
                <div className="absolute inset-0 bg-[#4169E1]/10 dark:bg-[#5278ed]/20 rounded-xl transform rotate-6 group-hover:rotate-12 transition-transform duration-300"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-[#4169E1] to-[#536DFE] dark:from-[#5278ed] dark:to-[#768FFF] rounded-xl flex items-center justify-center text-white transform group-hover:scale-110 transition-all duration-300">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-center text-gray-900 dark:text-white transition-colors duration-200">
                Verified Content
              </h3>
              <p className="mt-3 text-center text-gray-500 dark:text-gray-300 px-4 transition-colors duration-200">
                Access quality-assured learning materials and resources vetted by industry experts.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div 
        ref={statsRef} 
        className="py-24 bg-gradient-to-r from-[#4169E1]/5 to-[#2AB7CA]/5 dark:from-[#5278ed]/10 dark:to-[#4fc3d5]/10 transition-colors duration-200 animate-gradient"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Stat 1 */}
            <div className={`relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${statsInView ? 'animate-fadeInUp animate-delay-0' : 'opacity-0'}`}>
              <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-[#4169E1]/10 dark:bg-[#5278ed]/20"></div>
              <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2 relative z-10">Total Students</h3>
              <div className="text-5xl font-bold text-[#4169E1] dark:text-[#5278ed] mb-2 relative z-10">
                <span id="students-count">0</span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 relative z-10">Learners worldwide</p>
            </div>

            {/* Stat 2 */}
            <div className={`relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${statsInView ? 'animate-fadeInUp animate-delay-100' : 'opacity-0'}`}>
              <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-[#FF6F00]/10 dark:bg-[#FF7F1D]/20"></div>
              <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2 relative z-10">Available Courses</h3>
              <div className="text-5xl font-bold text-[#FF6F00] dark:text-[#FF7F1D] mb-2 relative z-10">
                <span id="courses-count">0</span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 relative z-10">Expert-crafted courses</p>
            </div>

            {/* Stat 3 */}
            <div className={`relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${statsInView ? 'animate-fadeInUp animate-delay-200' : 'opacity-0'}`}>
              <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-[#2AB7CA]/10 dark:bg-[#4fc3d5]/20"></div>
              <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2 relative z-10">Satisfaction Rate</h3>
              <div className="text-5xl font-bold text-[#2AB7CA] dark:text-[#4fc3d5] mb-2 relative z-10">
                <span id="ratings-count">0</span>%
              </div>
              <p className="text-gray-600 dark:text-gray-300 relative z-10">Student satisfaction</p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div 
        ref={testimonialsRef} 
        className="py-24 bg-white dark:bg-gray-800 transition-colors duration-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center max-w-3xl mx-auto mb-16 ${testimonialsInView ? 'animate-fadeIn' : 'opacity-0'}`}>
            <span className="inline-block px-3 py-1 text-sm font-semibold bg-[#2AB7CA]/10 dark:bg-[#4fc3d5]/20 text-[#2AB7CA] dark:text-[#4fc3d5] rounded-full mb-4 transition-colors duration-200">
              Testimonials
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white transition-colors duration-200">
              What our students say
            </h2>
            <p className="mt-4 text-xl text-gray-500 dark:text-gray-300 transition-colors duration-200">
              Success stories from our community of learners
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className={`bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ${testimonialsInView ? 'animate-fadeInUp animate-delay-0' : 'opacity-0'}`}>
              <div className="flex items-center mb-6">
                <div className="h-12 w-12 rounded-full overflow-hidden mr-4">
                  <Image 
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80" 
                    alt="Sarah Johnson"
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Sarah Johnson</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Web Developer</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 italic">
                "The mentorship program transformed my career. I went from struggling with code to landing my dream job in just 6 months!"
              </p>
              <div className="mt-4 flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className={`bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ${testimonialsInView ? 'animate-fadeInUp animate-delay-100' : 'opacity-0'}`}>
              <div className="flex items-center mb-6">
                <div className="h-12 w-12 rounded-full overflow-hidden mr-4">
                  <Image 
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80" 
                    alt="Michael Chen"
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Michael Chen</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Data Scientist</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 italic">
                "The courses here are incredibly well-structured. The hands-on projects helped me master complex data science concepts quickly."
              </p>
              <div className="mt-4 flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className={`bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ${testimonialsInView ? 'animate-fadeInUp animate-delay-200' : 'opacity-0'}`}>
              <div className="flex items-center mb-6">
                <div className="h-12 w-12 rounded-full overflow-hidden mr-4">
                  <Image 
                    src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80" 
                    alt="Sophia Martinez"
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Sophia Martinez</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">UX Designer</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 italic">
                "The community aspect is what sets this platform apart. I've made connections that led to job opportunities and collaborations."
              </p>
              <div className="mt-4 flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-24 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#4169E1] to-[#2AB7CA] dark:from-[#5278ed] dark:to-[#4fc3d5] opacity-90 transition-colors duration-500 animate-gradient"></div>
        
        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white opacity-10 mix-blend-overlay"></div>
        <div className="absolute -bottom-32 -left-32 w-[30rem] h-[30rem] rounded-full bg-white opacity-10 mix-blend-overlay"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 animate-fadeIn">
              Ready to start your learning journey?
            </h2>
            <p className="text-xl text-white text-opacity-90 mb-10 animate-fadeInUp animate-delay-100">
              Join thousands of students already learning with our expert mentors
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fadeInUp animate-delay-200">
              <Link
                href="/register"
                className="px-8 py-4 rounded-xl bg-white text-[#4169E1] dark:text-[#5278ed] font-medium shadow-lg shadow-blue-700/20 hover:shadow-xl hover:shadow-blue-700/30 hover:-translate-y-1 active:translate-y-0 transform transition-all duration-300"
              >
                Get Started for Free
              </Link>
              <Link
                href="/courses"
                className="px-8 py-4 rounded-xl bg-transparent text-white font-medium border border-white border-opacity-30 hover:bg-white/10 hover:-translate-y-1 active:translate-y-0 transform transition-all duration-300"
              >
                Browse Courses
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
