
import { test, expect } from '@playwright/test';

test('영화 페이지 UI 테스트', async ({ page }) => {
  // 메인 페이지 방문
  await page.goto('/');
  
  // 네비게이션 확인
  await expect(page.getByRole('navigation')).toBeVisible();
  
  // 영화 목록 확인
  await expect(page.getByRole('main')).toBeVisible();
  
  // 영화 카드 클릭
  const firstMovie = page.locator('.movie-card').first();
  await expect(firstMovie).toBeVisible();
  await firstMovie.click();
  
  // URL이 /movie/로 시작하는지 확인
  await expect(page).toHaveURL(/\/movie\/\d+/);
  
  // 상세 페이지 요소 확인
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('img')).toBeVisible();
  
  // 좋아요 버튼 테스트
  const likeButton = page.getByRole('button', { name: /좋아요/ });
  await expect(likeButton).toBeVisible();
  await likeButton.click();
  
  // 댓글 입력 테스트
  const commentInput = page.getByPlaceholder('댓글을 입력하세요');
  await expect(commentInput).toBeVisible();
  await commentInput.fill('테스트 댓글입니다');
  await page.getByRole('button', { name: '작성' }).click();
});

test('영화 검색 기능 테스트', async ({ page }) => {
  await page.goto('/');
  
  // 검색 입력창 확인
  const searchInput = page.getByPlaceholder('영화 검색...');
  await expect(searchInput).toBeVisible();
  
  // 검색어 입력
  await searchInput.fill('테스트');
  await searchInput.press('Enter');
  
  // 검색 결과 확인
  await expect(page.locator('.movie-card')).toBeVisible();
});
