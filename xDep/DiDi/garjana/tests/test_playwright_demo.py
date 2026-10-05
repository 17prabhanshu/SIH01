import pytest
from playwright.sync_api import Page, expect

@pytest.mark.skip(reason="Requires running UI server on port 3000")
def test_playwright_demo(page: Page):
    # Navigate to the frontend
    page.goto("http://localhost:3000")
    
    # Wait for the page to load
    page.wait_for_timeout(2000)
    
    # Control Room screenshot
    page.screenshot(path="docs/results/screens/control_room.png")
    
    # Storm Detail
    page.click("[title='Storm Detail']")
    page.wait_for_timeout(1000)
    page.screenshot(path="docs/results/screens/storm_detail.png")
    
    # Alert Desk
    page.click("[title='Alert Desk']")
    page.wait_for_timeout(1000)
    page.screenshot(path="docs/results/screens/alert_desk.png")
    
    # Verification
    page.click("[title='Verification']")
    page.wait_for_timeout(1000)
    page.screenshot(path="docs/results/screens/verification.png")
    
    # Data Health
    page.click("[title='Data Health']")
    page.wait_for_timeout(1000)
    page.screenshot(path="docs/results/screens/data_health.png")
