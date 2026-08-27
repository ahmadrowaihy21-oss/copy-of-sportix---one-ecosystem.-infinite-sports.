# Marketplace cart and checkout validation

The checkout rule is covered deterministically: only complete blocks of **1,000 points** are redeemable, and each block reduces the payable amount by **5 Saudi Riyals**. The implementation caps redemption at the member balance and the order total, so a negative cash balance cannot result. Cart tests cover adding a product, incrementing an existing item, changing a quantity, and removing an item when its quantity reaches zero.

The public `/marketplace/cart` and `/marketplace/checkout` entry states were reviewed at desktop and mobile viewport sizes. Both routes retain the Arabic right-to-left hierarchy, present an explicit empty-cart route, and provide a clear path back to products. The populated checkout uses the same order-summary components and values exercised by the automated cart and redemption tests. No checkout action initiates a real payment or deducts real points.
