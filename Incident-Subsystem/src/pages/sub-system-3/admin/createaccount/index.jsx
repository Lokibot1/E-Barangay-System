import React from 'react';
import AccountHeader from './components/AccountHeader';
import AccountSearch from './components/AccountSearch';
import AccountStats from './components/AccountStats';
import AccountsTableSection from './components/AccountsTableSection';
import AccountSuccessModal from './components/AccountSuccessModal';
import AccountTabs from './components/AccountTabs';
import AddAccountModal from './components/AddAccountModal';
import ResetPasswordModal from './components/ResetPasswordModal';
import ToggleConfirmationModal from './components/ToggleConfirmationModal';
import useCreateAccountsPage from './useCreateAccountsPage';

const CreateAccounts = () => {
  const {
    t,
    isDark,
    inputBase,
    currentTheme,
    fetching,
    fetchError,
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    showAddModal,
    resetTarget,
    pendingToggle,
    successData,
    setSuccessData,
    showPass,
    setShowPass,
    showResetPass,
    setShowResetPass,
    submitting,
    apiError,
    form,
    setForm,
    resetForm,
    setResetForm,
    isGmail,
    isEmailTaken,
    isUsernameTaken,
    isPassMatch,
    canSave,
    canReset,
    staffActive,
    staffInactive,
    totalAdmins,
    tabCounts,
    tableHeaders,
    currentItems,
    filteredLength,
    totalPages,
    itemsPerPage,
    openAddModal,
    closeAddModal,
    openResetModal,
    closeResetModal,
    setPendingToggle,
    closeToggleModal,
    handleCreate,
    handleResetSubmit,
    confirmToggle,
  } = useCreateAccountsPage();

  return (
    <div className={`min-h-full ${t.pageBg} font-kumbh`}>
      <div className="w-full px-4 sm:px-5 py-6 sm:py-8 space-y-6">
        <AccountHeader t={t} onNewAccount={openAddModal} />

        <AccountStats
          isDark={isDark}
          staffActiveCount={staffActive.length}
          staffInactiveCount={staffInactive.length}
          totalAdmins={totalAdmins}
        />

        <AccountSearch
          t={t}
          isDark={isDark}
          inputBase={inputBase}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onClear={() => setSearchTerm('')}
        />

        <AccountTabs
          activeTab={activeTab}
          isDark={isDark}
          tabCounts={tabCounts}
          fetching={fetching}
          onTabChange={setActiveTab}
        />

        <AccountsTableSection
          t={t}
          isDark={isDark}
          currentTheme={currentTheme}
          activeTab={activeTab}
          tableHeaders={tableHeaders}
          fetching={fetching}
          fetchError={fetchError}
          currentItems={currentItems}
          filteredLength={filteredLength}
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onToggle={setPendingToggle}
          onResetPassword={openResetModal}
        />
      </div>

      <AddAccountModal
        open={showAddModal}
        isDark={isDark}
        t={t}
        form={form}
        setForm={setForm}
        submitting={submitting}
        apiError={apiError}
        canSave={canSave}
        showPass={showPass}
        setShowPass={setShowPass}
        isGmail={isGmail}
        isEmailTaken={isEmailTaken}
        isUsernameTaken={isUsernameTaken}
        isPassMatch={isPassMatch}
        onClose={closeAddModal}
        onSubmit={handleCreate}
      />

      <ResetPasswordModal
        resetTarget={resetTarget}
        isDark={isDark}
        t={t}
        apiError={apiError}
        showResetPass={showResetPass}
        setShowResetPass={setShowResetPass}
        resetForm={resetForm}
        setResetForm={setResetForm}
        canReset={canReset}
        submitting={submitting}
        onClose={closeResetModal}
        onSubmit={handleResetSubmit}
      />

      <ToggleConfirmationModal
        pendingToggle={pendingToggle}
        isDark={isDark}
        t={t}
        apiError={apiError}
        submitting={submitting}
        onConfirm={confirmToggle}
        onClose={closeToggleModal}
      />

      <AccountSuccessModal
        successData={successData}
        isDark={isDark}
        t={t}
        onClose={() => setSuccessData(null)}
      />
    </div>
  );
};

export default CreateAccounts;
