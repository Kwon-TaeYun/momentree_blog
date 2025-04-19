import Link from 'next/link';
import Image from 'next/image';
import { useEffect } from 'react'
import { BiSearch } from 'react-icons/bi'; // BiSearch 아이콘도 필요함
import React from 'react';
export default function Footer() {
    return (
        <footer className="border-t border-gray-200 py-8 mt-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-medium mb-4">서비스</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/about">이용약관</Link></li>
                <li><Link href="/privacy">개인정보처리방침</Link></li>
                <li><Link href="/contact">고객센터</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-4">커뮤니티</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/blog">블로그</Link></li>
                <li><Link href="/discussion">디스커션</Link></li>
                <li><Link href="/events">이벤트</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-4">소셜</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="https://instagram.com">Instagram</Link></li>
                <li><Link href="https://twitter.com">Twitter</Link></li>
                <li><Link href="https://facebook.com">Facebook</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-4">문의</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="mailto:contact@example.com">contact@example.com</a></li>
                <li><a href="tel:02-1234-5678">02-1234-5678</a></li>
                <li>서울특별시 강남구</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-100 text-sm text-gray-500">
            <p>© 2024 Momentree. All rights reserved.</p>
          </div>
        </div>
      </footer>

        )
    }
