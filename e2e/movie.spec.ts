
import { test, expect } from '@playwright/test';

test('영화 상세 페이지 테스트', async ({ page }) => {
  await page.goto('/movie/1');
  
  // 제목 확인
  await expect(page.getByRole('heading')).toContainText('영화 제목');
  
  // 좋아요 버튼 테스트
  const likeButton = page.getByRole('button', { name: /좋아요/ });
  await expect(likeButton).toBeVisible();
  await likeButton.click();
  await expect(likeButton).toContainText('좋아요 취소');
  
  // 댓글 작성 테스트
  await page.getByPlaceholder('댓글을 입력하세요').fill('테스트 댓글입니다');
  await page.getByRole('button', { name: '작성' }).click();
  await expect(page.getByText('테스트 댓글입니다')).toBeVisible();
});
