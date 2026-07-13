import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getProductBySlugApi } from '../api/productApi.js';
import ProductGrid from '../components/product/ProductGrid.jsx';
import Loader from '../components/common/Loader.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import Button from '../components/common/Button.jsx';

const WishlistPage = () => {
    const { user, isLoading: isAuthLoading } = useAuth();
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const wishlistIds = useMemo(
        () => (user?.wishlist || []).map((id) => (typeof id === 'string' ? id : id?.toString())),
        [user?.wishlist]
    );
    const wishlistKey = wishlistIds.join(',');

    useEffect(() => {
        if (isAuthLoading) return;

        if (!user || wishlistIds.length === 0) {
            setProducts([]);
            setIsLoading(false);
            return;
        }

        let isCancelled = false;
        setIsLoading(true);

        Promise.all(
            wishlistIds.map((id) =>
                getProductBySlugApi(id)
                    .then(({ data }) => data.data.product)
                    .catch(() => null)
            )
        ).then((results) => {
            if (!isCancelled) {
                setProducts(results.filter(Boolean));
                setIsLoading(false);
            }
        });

        return () => {
            isCancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthLoading, user, wishlistKey]);

    // Derive the visible list from the current wishlist ids so toggling the
    // heart off on a card (which updates `user.wishlist` immediately) removes
    // the item here too, without an extra round trip.
    const visibleProducts = useMemo(
        () => products.filter((product) => wishlistIds.includes(product._id)),
        [products, wishlistIds]
    );

    if (isAuthLoading || isLoading) return <Loader fullScreen />;

    if (!user) {
        return (
            <div className="container-tgs py-16">
                <EmptyState
                    title="Sign in to view your wishlist"
                    description="Save your favourite gifts and pick up right where you left off."
                />
                <div className="mt-6 flex justify-center">
                    <Link to="/login">
                        <Button>Sign In</Button>
                    </Link>
                </div>
            </div>
        );
    }

    if (visibleProducts.length === 0) {
        return (
            <div className="container-tgs py-16">
                <EmptyState
                    title="Your wishlist is empty"
                    description="Tap the heart on any product to save it here for later."
                />
                <div className="mt-6 flex justify-center">
                    <Link to="/products">
                        <Button>Explore Gifts</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container-tgs py-8 sm:py-12">
            <h1 className="mb-8 font-display text-2xl font-semibold text-charcoal sm:text-3xl">My Wishlist</h1>
            <ProductGrid products={visibleProducts} />
        </div>
    );
};

export default WishlistPage;