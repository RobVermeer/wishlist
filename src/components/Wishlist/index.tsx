import { EmptyState } from "@/components/EmptyState";
import { List } from "@/components/List";
import { ListTitle } from "@/components/ListTitle";
import { WishlistTitle } from "@/components/WishlistTitle";
import { YourItemCard } from "@/components/YourItemCard";
import { getWishlistById } from "@/lib/wishlists/getWishlistById";
import { NewItem } from "@/components/NewItem";
import { notFound } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { getMessages, getTranslations } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { pickMessages } from "@/utils/pick";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/utils/string";
import { getGroupById } from "@/lib/groups/getGroupById";
import { canBeRemindedForUser } from "@/lib/reminders";
import { RemindButton } from "../RemindButton";
import { ItemCard } from "../ItemCard";
import Link from "next/link";

interface Props {
  id: string;
  groupId?: string;
}

export const Wishlist = async ({ id, groupId }: Props) => {
  const wishlist = await getWishlistById(id);
  const group = groupId ? await getGroupById(groupId) : null;
  const t = await getTranslations("GroupWishlist");
  const messages = await getMessages();

  if (!wishlist) {
    notFound();
  }

  const canBeReminded = await canBeRemindedForUser(wishlist.user.id);

  return (
    <List>
      <div className="text-center">
        {!wishlist.title && wishlist.user.image && (
          <Avatar className="inline-block w-14 h-14 border border-slate-500">
            <AvatarImage
              src={wishlist.user.image}
              alt={`@${wishlist.user.name}`}
            />
            <AvatarFallback>{getInitials(wishlist.user.name)}</AvatarFallback>
          </Avatar>
        )}
        <ListTitle>
          <WishlistTitle wishlist={wishlist} />{" "}
          {group && (
            <small className="text-base text-foreground">
              In{" "}
              <Link
                className="underline underline-offset-2"
                href={`/group/${group.id}`}
              >
                {group.title}
              </Link>
            </small>
          )}
        </ListTitle>

        {wishlist.description && (
          <small className="italic text-sm">{wishlist.description}</small>
        )}
      </div>

      {wishlist.wishlistItem.map((item) => {
        if (wishlist.isOwnList) {
          return <YourItemCard key={item.id} item={item} />;
        }

        return <ItemCard key={item.id} item={item} />;
      })}

      {wishlist.wishlistItem.length === 0 && (
        <EmptyState title={t("empty.title")}>{t("empty.text")}</EmptyState>
      )}

      {(wishlist.isOwnList || canBeReminded) && <Separator className="my-3" />}

      {wishlist.isOwnList && (
        <NextIntlClientProvider messages={pickMessages(messages, "NewItem")}>
          <NewItem id={wishlist.id} />
        </NextIntlClientProvider>
      )}

      {canBeReminded && !wishlist.isOwnList && (
        <NextIntlClientProvider messages={pickMessages(messages, "Remind")}>
          <RemindButton wishlist={wishlist} />
        </NextIntlClientProvider>
      )}
    </List>
  );
};
