#!/usr/bin/env python3
"""
Automated Stripe Setup Script
Creates products, prices, and configures webhooks for MNNR application
"""

import os
import sys
import json
import requests

# Get Stripe API key from environment
STRIPE_API_KEY = os.getenv('STRIPE_SECRET_KEY')
if not STRIPE_API_KEY:
    print("❌ Error: STRIPE_SECRET_KEY not found in environment")
    sys.exit(1)

BASE_URL = "https://api.stripe.com/v1"
HEADERS = {
    "Authorization": f"Bearer {STRIPE_API_KEY}",
    "Content-Type": "application/x-www-form-urlencoded"
}

def create_product(name, description):
    """Create a Stripe product"""
    print(f"Creating product: {name}...")
    
    data = {
        "name": name,
        "description": description,
        "type": "service"
    }
    
    response = requests.post(
        f"{BASE_URL}/products",
        headers=HEADERS,
        data=data
    )
    
    if response.status_code == 200:
        product = response.json()
        print(f"✅ Product created: {product['id']}")
        return product
    else:
        print(f"❌ Error creating product: {response.text}")
        return None

def create_price(product_id, amount, interval="month"):
    """Create a price for a product"""
    print(f"Creating price: ${amount/100}/{interval}...")
    
    data = {
        "product": product_id,
        "unit_amount": amount,
        "currency": "usd",
        "recurring[interval]": interval
    }
    
    response = requests.post(
        f"{BASE_URL}/prices",
        headers=HEADERS,
        data=data
    )
    
    if response.status_code == 200:
        price = response.json()
        print(f"✅ Price created: {price['id']}")
        return price
    else:
        print(f"❌ Error creating price: {response.text}")
        return None

def list_webhook_endpoints():
    """List existing webhook endpoints"""
    response = requests.get(
        f"{BASE_URL}/webhook_endpoints",
        headers=HEADERS
    )
    
    if response.status_code == 200:
        return response.json()['data']
    return []

def create_webhook_endpoint(url):
    """Create a webhook endpoint"""
    print(f"Creating webhook endpoint: {url}...")
    
    # Check if endpoint already exists
    existing = list_webhook_endpoints()
    for endpoint in existing:
        if endpoint['url'] == url:
            print(f"✅ Webhook endpoint already exists: {endpoint['id']}")
            print(f"   Secret: {endpoint.get('secret', 'N/A')}")
            return endpoint
    
    data = {
        "url": url,
        "enabled_events[]": [
            "customer.subscription.created",
            "customer.subscription.updated",
            "customer.subscription.deleted",
            "invoice.paid",
            "invoice.payment_failed",
            "payment_method.attached",
            "payment_method.detached"
        ]
    }
    
    response = requests.post(
        f"{BASE_URL}/webhook_endpoints",
        headers=HEADERS,
        data=data
    )
    
    if response.status_code == 200:
        webhook = response.json()
        print(f"✅ Webhook created: {webhook['id']}")
        print(f"   Secret: {webhook['secret']}")
        return webhook
    else:
        print(f"❌ Error creating webhook: {response.text}")
        return None

def main():
    print("=" * 60)
    print("🚀 AUTOMATED STRIPE SETUP")
    print("=" * 60)
    print()
    
    # Check API connection
    print("Testing Stripe API connection...")
    response = requests.get(f"{BASE_URL}/account", headers=HEADERS)
    if response.status_code != 200:
        print(f"❌ Failed to connect to Stripe API: {response.text}")
        sys.exit(1)
    
    account = response.json()
    print(f"✅ Connected to Stripe account: {account.get('business_profile', {}).get('name', account['id'])}")
    print()
    
    # Create products and prices
    products_config = [
        {
            "name": "Basic Plan",
            "description": "Perfect for individuals and small projects",
            "price": 999  # $9.99
        },
        {
            "name": "Pro Plan",
            "description": "For growing teams and businesses",
            "price": 2999  # $29.99
        },
        {
            "name": "Enterprise Plan",
            "description": "Advanced features for large organizations",
            "price": 9999  # $99.99
        }
    ]
    
    created_products = []
    
    for config in products_config:
        product = create_product(config["name"], config["description"])
        if product:
            price = create_price(product["id"], config["price"])
            if price:
                created_products.append({
                    "product": product,
                    "price": price
                })
        print()
    
    # Create webhook endpoint (placeholder URL - will be updated after deployment)
    webhook_url = "https://mnnr-complete2025.vercel.app/api/webhooks"
    print(f"Setting up webhook endpoint...")
    print(f"Note: Update this URL after deployment")
    print()
    webhook = create_webhook_endpoint(webhook_url)
    print()
    
    # Summary
    print("=" * 60)
    print("✅ STRIPE SETUP COMPLETE!")
    print("=" * 60)
    print()
    print("Created Products & Prices:")
    for item in created_products:
        product = item["product"]
        price = item["price"]
        amount = price["unit_amount"] / 100
        print(f"  • {product['name']}: ${amount}/month")
        print(f"    Product ID: {product['id']}")
        print(f"    Price ID: {price['id']}")
        print()
    
    if webhook:
        print("Webhook Endpoint:")
        print(f"  URL: {webhook['url']}")
        print(f"  Secret: {webhook['secret']}")
        print()
        print("⚠️  IMPORTANT: Add this to your environment variables:")
        print(f"  STRIPE_WEBHOOK_SECRET={webhook['secret']}")
        print()
    
    # Save configuration
    config_file = "/home/ubuntu/mnnr-complete2025/stripe-config.json"
    config_data = {
        "products": created_products,
        "webhook": webhook,
        "account_id": account["id"]
    }
    
    with open(config_file, 'w') as f:
        json.dump(config_data, f, indent=2)
    
    print(f"Configuration saved to: {config_file}")
    print()
    print("🎉 Ready for deployment!")

if __name__ == "__main__":
    main()
