import { useState, useEffect, useCallback, useRef } from 'react';

interface UseSectionNavigationProps {
  sectionIds: string[];
}

interface UseSectionNavigationReturn {
  activeSection: string;
  scrollToSection: (sectionId: string) => void;
}

export default function useSectionNavigation({
  sectionIds,
}: UseSectionNavigationProps): UseSectionNavigationReturn {
  const [activeSection, setActiveSection] = useState<string>(sectionIds[0] ?? '');
  const visibleSectionsRef = useRef<Set<string>>(new Set());

  // 페이지 로드 시 URL 앵커로 자동 스크롤
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash.slice(1);
    if (hash && sectionIds.includes(hash)) {
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setActiveSection(hash);
        }
      }, 100);
    }
  }, [sectionIds]);

  // IntersectionObserver로 현재 보이는 섹션 추적
  useEffect(() => {
    if (typeof window === 'undefined' || sectionIds.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id;
          if (entry.isIntersecting) {
            visibleSectionsRef.current.add(id);
          } else {
            visibleSectionsRef.current.delete(id);
          }
        });

        // 보이는 섹션 중 가장 위에 있는 섹션을 active로 설정
        for (const id of sectionIds) {
          if (visibleSectionsRef.current.has(id)) {
            setActiveSection(id);
            break;
          }
        }
      },
      {
        rootMargin: '-100px 0px -50% 0px',
        threshold: 0,
      },
    );

    // 각 섹션 요소 observe
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, [sectionIds]);

  const scrollToSection = useCallback((sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // URL에 앵커 추가
      window.history.replaceState(null, '', `#${sectionId}`);
    }
  }, []);

  return { activeSection, scrollToSection };
}
